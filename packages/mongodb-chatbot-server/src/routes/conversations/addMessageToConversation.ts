import { stripIndents } from "common-tags";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { ObjectId, EmbeddedContent, References } from "mongodb-rag-core";
import {
  ConversationsService,
  Conversation,
  SomeMessage,
} from "../../services/ConversationsService";
import { DataStreamer, makeDataStreamer } from "../../services/dataStreamer";
import { ChatLlm, OpenAiChatMessage } from "../../services/ChatLlm";
import {
  ApiMessage,
  RequestError,
  convertMessageFromDbToApi,
  makeRequestError,
} from "./utils";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";
import { QueryPreprocessorFunc } from "../../processors/QueryPreprocessorFunc";
import { FindContentFunc } from "./FindContentFunc";
import {
  AddCustomDataFunc,
  ConversationsRouterLocals,
} from "./conversationsRouter";

export const DEFAULT_MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM
export const DEFAULT_MAX_MESSAGES_IN_CONVERSATION = 13; // magic number for max messages in a conversation
export const DEFAULT_MAX_CONTEXT_TOKENS = 1500; // magic number for max context tokens for LLM

export type AddMessageRequestBody = z.infer<typeof AddMessageRequestBody>;
export const AddMessageRequestBody = z.object({
  message: z.string(),
});

export const AddMessageRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    params: z.object({
      conversationId: z.string(),
    }),
    query: z.object({
      stream: z.string().optional(),
    }),
    body: AddMessageRequestBody,
  })
);

export type AddMessageRequest = z.infer<typeof AddMessageRequest>;

export interface AddMessageToConversationRouteParams {
  conversations: ConversationsService;
  llm: ChatLlm;
  dataStreamer: DataStreamer;
  userQueryPreprocessor?: QueryPreprocessorFunc;
  maxChunkContextTokens?: number;
  maxInputLengthCharacters?: number;
  maxMessagesInConversation?: number;
  findContent: FindContentFunc;
  makeReferenceLinks?: MakeReferenceLinksFunc;
  addMessageToConversationCustomData?: AddCustomDataFunc;
}

export function makeAddMessageToConversationRoute({
  conversations,
  llm,
  dataStreamer,
  findContent,
  userQueryPreprocessor,
  maxChunkContextTokens = DEFAULT_MAX_CONTEXT_TOKENS,
  maxInputLengthCharacters = DEFAULT_MAX_INPUT_LENGTH,
  maxMessagesInConversation = DEFAULT_MAX_MESSAGES_IN_CONVERSATION,
  makeReferenceLinks = makeDefaultReferenceLinks,
  addMessageToConversationCustomData,
}: AddMessageToConversationRouteParams) {
  return async (
    req: ExpressRequest<AddMessageRequest["params"]>,
    res: ExpressResponse<ApiMessage, ConversationsRouterLocals>
  ) => {
    const reqId = getRequestId(req);
    try {
      const {
        params: { conversationId: conversationIdString },
        body: { message },
        query: { stream },
        ip,
      } = req;
      logRequest({
        reqId,
        message: stripIndents`Request info:
          User message: ${message}
          Stream: ${stream}
          IP: ${ip}
          ConversationId: ${conversationIdString}`,
      });

      const latestMessageText = message;

      if (latestMessageText.length > maxInputLengthCharacters) {
        throw makeRequestError({
          httpStatus: 400,
          message: "Message too long",
        });
      }

      const customData = await getCustomData({
        req,
        res,
        addMessageToConversationCustomData,
      });

      // --- LOAD CONVERSATION ---
      const conversation = await loadConversation({
        conversationIdString,
        conversations,
      });

      // --- MAX CONVERSATION LENGTH CHECK ---
      if (conversation.messages.length >= maxMessagesInConversation) {
        // Omit the system prompt and assume the user always received one response per message
        const maxUserMessages = (maxMessagesInConversation - 1) / 2;
        throw makeRequestError({
          httpStatus: 400,
          message: `Too many messages. You cannot send more than ${maxUserMessages} messages in this conversation.`,
        });
      }

      // --- PREPROCESS ---
      const preprocessResult = await (async (): Promise<
        { query: string; rejectQuery: boolean } | undefined
      > => {
        // Try to preprocess the user's message. If the user's message cannot be preprocessed
        // (likely due to LLM timeout), then we will just use the original message.
        if (!userQueryPreprocessor) {
          return undefined;
        }
        try {
          const { query, rejectQuery } = await userQueryPreprocessor({
            query: latestMessageText,
            messages: conversation.messages,
          });
          logRequest({
            reqId,
            message: stripIndents`Successfully preprocessed user query.
              Original query: ${latestMessageText}
              Preprocessed query: ${query}`,
          });
          return { query: query ?? latestMessageText, rejectQuery };
        } catch (err: unknown) {
          logRequest({
            reqId,
            type: "error",
            message: `Error preprocessing query: ${JSON.stringify(
              err
            )}. Using original query: ${latestMessageText}`,
          });
        }
      })();
      const shouldStream = Boolean(stream);
      const { rejectQuery, query: preprocessedUserMessageContent } =
        preprocessResult ?? {};
      if (rejectQuery) {
        return await sendStaticNonResponse({
          conversations,
          conversation,
          rejectQuery,
          preprocessedUserMessageContent,
          latestMessageText,
          shouldStream,
          dataStreamer,
          res,
          originalMessageEmbedding: [],
        });
      }
      const query = preprocessedUserMessageContent ?? latestMessageText;

      // --- VECTOR SEARCH / RETRIEVAL ---
      const { content, queryEmbedding } = await findContent({
        query,
        ipAddress: ip ?? "::1",
      });
      if (content.length === 0) {
        logRequest({
          reqId,
          message: "No matching content found",
        });
        return await sendStaticNonResponse({
          conversations,
          conversation,
          preprocessedUserMessageContent,
          latestMessageText,
          shouldStream,
          dataStreamer,
          res,
          originalMessageEmbedding: queryEmbedding,
        });
      }

      logRequest({
        reqId,
        message: stripIndents`Chunks found: ${JSON.stringify(
          content.map(
            ({ embedding, chunkAlgoHash, ...wantedProperties }) =>
              wantedProperties
          )
        )}`,
      });

      const references = makeReferenceLinks(content);
      const chunkTexts = includeChunksForMaxTokensPossible({
        maxTokens: maxChunkContextTokens,
        content,
      }).map(({ text }) => text);

      const latestMessage = {
        content: query,
        role: "user",
      } satisfies OpenAiChatMessage;
      logRequest({
        reqId,
        message: `Latest message sent to LLM: ${JSON.stringify(latestMessage)}`,
      });

      const messages = [
        ...conversation.messages.map(convertDbMessageToOpenAiMessage),
        latestMessage,
      ] satisfies OpenAiChatMessage[];

      // --- GENERATE RESPONSE ---
      const answerContent = await (async () => {
        if (shouldStream) {
          const answerStream = await llm.answerQuestionStream({
            messages,
            chunks: chunkTexts,
          });
          dataStreamer.connect(res);
          const answerContent = await dataStreamer.stream({
            stream: answerStream,
          });
          logRequest({
            reqId,
            message: `LLM response: ${JSON.stringify(answerContent)}`,
          });
          dataStreamer.streamData({
            type: "references",
            data: references,
          });
          return answerContent;
        }

        try {
          const messages = [
            ...conversation.messages.map(convertDbMessageToOpenAiMessage),
            latestMessage,
          ];
          logRequest({
            reqId,
            message: `LLM query: ${JSON.stringify(messages)}`,
          });
          // --- GENERATE RESPONSE ---
          const answer = await llm.answerQuestionAwaited({
            messages,
            chunks: chunkTexts,
          });
          logRequest({
            reqId,
            message: `LLM response: ${JSON.stringify(answer)}`,
          });
          return answer.content;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : JSON.stringify(err);
          logRequest({
            reqId: req.headers["req-id"] as string,
            message: `LLM error: ${errorMessage}`,
            type: "error",
          });
          logRequest({
            reqId,
            message: "Only sending vector search results to user",
          });
          const answer = {
            role: "assistant",
            content: conversations.conversationConstants.LLM_NOT_WORKING,
          } satisfies OpenAiChatMessage;
          return answer.content;
        }
      })();

      if (!answerContent) {
        throw makeRequestError({
          httpStatus: 500,
          message: "No answer content",
        });
      }

      // --- SAVE QUESTION & RESPONSE ---
      const { assistantMessage } = await addMessagesToDatabase({
        conversations,
        conversation,
        preprocessedUserMessageContent,
        originalUserMessageContent: message,
        assistantMessageContent: answerContent,
        assistantMessageReferences: references,
        userMessageEmbedding: queryEmbedding,
        customData,
      });

      const apiRes = convertMessageFromDbToApi(assistantMessage);

      if (!shouldStream) {
        return res.status(200).json(apiRes);
      }

      dataStreamer.streamData({
        type: "finished",
        data: apiRes.id,
      });

      dataStreamer.disconnect();
    } catch (error) {
      const { httpStatus, message } =
        (error as Error).name === "RequestError"
          ? (error as RequestError)
          : makeRequestError({
              message: (error as Error).message,
              stack: (error as Error).stack,
              httpStatus: 500,
            });

      if (dataStreamer.connected) {
        dataStreamer.disconnect();
      }
      sendErrorResponse({
        res,
        reqId,
        httpStatus,
        errorMessage: message,
      });
    }
  };
}

async function getCustomData({
  req,
  res,
  addMessageToConversationCustomData,
}: {
  req: ExpressRequest;
  res: ExpressResponse<ApiMessage, ConversationsRouterLocals>;
  addMessageToConversationCustomData?: AddCustomDataFunc;
}) {
  try {
    return addMessageToConversationCustomData
      ? await addMessageToConversationCustomData(req, res)
      : undefined;
  } catch (_err) {
    throw makeRequestError({
      httpStatus: 500,
      message: "Unable to process custom data",
    });
  }
}

export async function sendStaticNonResponse({
  conversations,
  conversation,
  preprocessedUserMessageContent,
  latestMessageText,
  shouldStream,
  dataStreamer,
  res,
  rejectQuery,
  originalMessageEmbedding,
}: {
  conversations: ConversationsService;
  conversation: Conversation;
  rejectQuery?: boolean;
  preprocessedUserMessageContent?: string;
  latestMessageText: string;
  shouldStream: boolean;
  dataStreamer: DataStreamer;
  res: ExpressResponse<ApiMessage>;
  originalMessageEmbedding: number[];
}) {
  const { assistantMessage } = await addMessagesToDatabase({
    conversations,
    conversation,
    rejectQuery,
    preprocessedUserMessageContent: preprocessedUserMessageContent,
    originalUserMessageContent: latestMessageText,
    userMessageEmbedding: originalMessageEmbedding,
    assistantMessageContent:
      conversations.conversationConstants.NO_RELEVANT_CONTENT,
    assistantMessageReferences: [],
  });
  const apiRes = convertMessageFromDbToApi(assistantMessage);
  if (shouldStream) {
    dataStreamer.connect(res);
    dataStreamer.streamData({
      type: "delta",
      data: apiRes.content,
    });
    dataStreamer.streamData({
      type: "finished",
      data: apiRes.id,
    });
    dataStreamer.disconnect();
    return;
  } else {
    return res.status(200).json(apiRes);
  }
}

export function convertDbMessageToOpenAiMessage(
  message: SomeMessage
): OpenAiChatMessage {
  const { content, role } = message;
  if (role === "system") {
    return {
      content: content,
      role: "system",
    } satisfies OpenAiChatMessage;
  }
  if (role === "function") {
    return {
      content: content,
      role: "function",
      name: message.name,
    } satisfies OpenAiChatMessage;
  }
  if (role === "user") {
    return {
      content: content,
      role: "user",
    } satisfies OpenAiChatMessage;
  }
  if (role === "assistant") {
    return {
      content: content,
      role: "assistant",
      ...(message.functionCall ? { functionCall: message.functionCall } : {}),
    } satisfies OpenAiChatMessage;
  }
  throw new Error(`Invalid message role: ${role}`);
}
interface AddMessagesToDatabaseParams {
  conversation: Conversation;
  originalUserMessageContent: string;
  preprocessedUserMessageContent?: string;
  assistantMessageContent: string;
  assistantMessageReferences: References;
  conversations: ConversationsService;
  userMessageEmbedding: number[];
  rejectQuery?: boolean;
  customData?: Record<string, unknown>;
}

export async function addMessagesToDatabase({
  conversation,
  originalUserMessageContent,
  preprocessedUserMessageContent,
  assistantMessageContent,
  assistantMessageReferences,
  conversations,
  userMessageEmbedding,
  rejectQuery,
  customData,
}: AddMessagesToDatabaseParams) {
  // TODO: consider refactoring addConversationMessage to take in an array of messages.
  // Would limit database calls.
  const conversationId = conversation._id;
  const userMessage = await conversations.addConversationMessage({
    conversationId,
    message: {
      content: originalUserMessageContent,
      role: "user",
      embedding: userMessageEmbedding,
      preprocessedContent: preprocessedUserMessageContent,
      rejectQuery,
      customData,
    },
  });
  const assistantMessage = await conversations.addConversationMessage({
    conversationId,
    message: {
      content: assistantMessageContent,
      role: "assistant",
      references: assistantMessageReferences,
    },
  });
  return { userMessage, assistantMessage };
}

/**
  Function that generates the references in the response to user.
 */
export type MakeReferenceLinksFunc = (chunks: EmbeddedContent[]) => References;

/**
  The default reference format returns the following for chunks from _unique_ pages:

  ```js
  {
    title: chunk.metadata.pageTitle ?? chunk.url, // if title doesn't exist, just put url
    url: chunk.url // this always exists
  }
  ```
 */
export const makeDefaultReferenceLinks: MakeReferenceLinksFunc = (chunks) => {
  // Filter chunks with unique URLs
  const uniqueUrls = new Set();
  const uniqueChunks = chunks.filter((chunk) => {
    if (!uniqueUrls.has(chunk.url)) {
      uniqueUrls.add(chunk.url);
      return true; // Keep the chunk as it has a unique URL
    }
    return false; // Discard the chunk as its URL is not unique
  });

  return uniqueChunks.map((chunk) => {
    return {
      title: (chunk.metadata?.pageTitle as string) ?? chunk.url,
      url: chunk.url,
    };
  });
};

/**
  This function will return the chunks that can fit in the maxTokens.
  It limits the number of tokens that are sent to the LLM.
 */
export function includeChunksForMaxTokensPossible({
  maxTokens,
  content,
}: {
  maxTokens: number;
  content: EmbeddedContent[];
}): EmbeddedContent[] {
  let total = 0;
  const fitRangeEndIndex = content.findIndex(
    ({ tokenCount }) => (total += tokenCount) > maxTokens
  );
  return fitRangeEndIndex === -1 ? content : content.slice(0, fitRangeEndIndex);
}

const loadConversation = async ({
  conversationIdString,
  conversations,
}: {
  conversationIdString: string;
  conversations: ConversationsService;
}) => {
  const conversationId = toObjectId(conversationIdString);
  const conversation = await conversations.findById({
    _id: conversationId,
  });
  if (!conversation) {
    throw makeRequestError({
      httpStatus: 404,
      message: `Conversation ${conversationId} not found`,
    });
  }
  return conversation;
};

const toObjectId = (id: string) => {
  try {
    return new ObjectId(id);
  } catch (error) {
    throw makeRequestError({
      httpStatus: 400,
      message: `Invalid ObjectId string: ${id}`,
    });
  }
};
