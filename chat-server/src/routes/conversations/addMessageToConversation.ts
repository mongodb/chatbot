import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import {
  ObjectId,
  EmbedFunc,
  EmbeddedContent,
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
  References,
  Reference,
} from "chat-core";
import {
  ConversationsService,
  Message,
  conversationConstants,
} from "../../services/conversations";
import { DataStreamer } from "../../services/dataStreamer";
import {
  ChatLlm,
  OpenAiChatMessage,
  OpenAiMessageRole,
} from "../../services/ChatLlm";
import {
  ApiConversation,
  ApiMessage,
  convertMessageFromDbToApi,
  isValidIp,
} from "./utils";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";
import { SearchBooster } from "../../processors/SearchBooster";
import { QueryPreprocessorFunc } from "../../processors/QueryPreprocessorFunc";
import { stripIndents } from "common-tags";

export const MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM
export const MAX_MESSAGES_IN_CONVERSATION = 13; // magic number for max messages in a conversation

export type AddMessageRequestBody = z.infer<typeof AddMessageRequestBody>;
export const AddMessageRequestBody = z.object({
  message: z.string(),
});

export type AddMessageRequest = z.infer<typeof AddMessageRequest>;
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
    ip: z.string(),
  })
);

export interface AddMessageToConversationRouteParams {
  store: EmbeddedContentStore;
  conversations: ConversationsService;
  embed: EmbedFunc;
  llm: ChatLlm;
  dataStreamer: DataStreamer;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  searchBoosters?: SearchBooster[];
  userQueryPreprocessor?: QueryPreprocessorFunc;
  maxChunkContextTokens?: number;
}

export type RequestError = Error & {
  httpStatus: number;
};

export const makeRequestError = (
  args: Omit<RequestError, "name">
): RequestError => ({ ...args, name: "RequestError" });

export function makeAddMessageToConversationRoute({
  store,
  conversations,
  llm,
  dataStreamer,
  embed,
  findNearestNeighborsOptions,
  searchBoosters,
  userQueryPreprocessor,
  maxChunkContextTokens = 1500,
}: AddMessageToConversationRouteParams) {
  return async (req: ExpressRequest, res: ExpressResponse<ApiMessage>) => {
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

      if (!isValidIp(ip)) {
        throw makeRequestError({
          httpStatus: 400,
          message: `Invalid IP address ${ip}`,
        });
      }

      const latestMessageText = message;
      if (latestMessageText.length > MAX_INPUT_LENGTH) {
        throw makeRequestError({
          httpStatus: 400,
          message: "Message too long",
        });
      }

      // --- LOAD CONVERSATION ---
      const conversationId = new ObjectId(conversationIdString);
      const conversationInDb = await conversations.findById({
        _id: conversationId,
      });
      if (!conversationInDb) {
        throw makeRequestError({
          httpStatus: 404,
          message: `Conversation ${conversationId} not found`,
        });
      }

      // --- MAX CONVERSATION LENGTH CHECK ---
      if (conversationInDb.messages.length >= MAX_MESSAGES_IN_CONVERSATION) {
        // Omit the system prompt and assume the user always received one response per message
        const maxUserMessages = (MAX_MESSAGES_IN_CONVERSATION - 1) / 2;
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
            messages: conversationInDb.messages,
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
          conversationId,
          rejectQuery,
          preprocessedUserMessageContent,
          latestMessageText,
          shouldStream,
          dataStreamer,
          res,
        });
      }
      const query = preprocessedUserMessageContent ?? latestMessageText;

      // --- VECTOR SEARCH / RETRIEVAL ---
      const contentForText = await getContentForText({
        embed,
        ipAddress: ip,
        text: query,
        store,
        findNearestNeighborsOptions,
      });
      const embedding = contentForText.embedding;
      let chunks = contentForText.results;
      if (searchBoosters?.length) {
        for (const booster of searchBoosters) {
          if (booster.shouldBoost({ text: latestMessageText })) {
            chunks = await booster.boost({
              existingResults: chunks,
              embedding,
              store,
            });
          }
        }
      }
      logRequest({
        reqId,
        message: stripIndents`Chunks found: ${JSON.stringify(
          chunks.map(
            ({
              sourceName,
              url,
              score,
              text,
              tokenCount,
              updated,
              metadata,
              chunkIndex,
            }) => ({
              sourceName,
              url,
              score,
              text,
              tokenCount,
              updated,
              metadata,
              chunkIndex,
            })
          )
        )}`,
      });

      if (chunks.length === 0) {
        logRequest({
          reqId,
          message: "No matching content found",
        });
        return await sendStaticNonResponse({
          conversations,
          conversationId,
          preprocessedUserMessageContent,
          latestMessageText,
          shouldStream,
          dataStreamer,
          res,
        });
      }

      const references = generateReferences({ chunks });
      const chunkTexts = includeChunksForMaxTokensPossible({
        maxTokens: maxChunkContextTokens,
        chunks,
      }).map((chunk) => chunk.text);

      const latestMessage = {
        content: query,
        role: "user",
      } satisfies OpenAiChatMessage;
      logRequest({
        reqId,
        message: `Latest message sent to LLM: ${JSON.stringify(latestMessage)}`,
      });

      const messages = [
        ...conversationInDb.messages.map(convertDbMessageToOpenAiMessage),
        latestMessage,
      ] satisfies OpenAiChatMessage[];

      // --- TO STREAM OR NOT TO STREAM ---
      let answerContent;
      if (shouldStream) {
        // --- GENERATE RESPONSE ---
        const answerStream = await llm.answerQuestionStream({
          messages,
          chunks: chunkTexts,
        });
        dataStreamer.connect(res);
        answerContent = await dataStreamer.stream({
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
      } else {
        try {
          const messages = [
            ...conversationInDb.messages.map(convertDbMessageToOpenAiMessage),
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
          answerContent = answer.content;
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
            content: conversationConstants.LLM_NOT_WORKING,
          } satisfies OpenAiChatMessage;
          answerContent = answer.content;
        }
      }

      if (!answerContent) {
        throw new Error("No answer content");
      }

      // --- SAVE QUESTION & RESPONSE ---
      const { assistantMessage } = await addMessagesToDatabase({
        conversations,
        conversationId,
        originalUserMessageContent: message,
        preprocessedUserMessageContent,
        assistantMessageContent: answerContent,
        assistantMessageReferences: references,
        userMessageEmbedding: embedding,
      });

      const apiRes = convertMessageFromDbToApi(assistantMessage);
      if (shouldStream) {
        dataStreamer.streamData({
          type: "finished",
          data: apiRes.id,
        });
        dataStreamer.disconnect();
        return;
      } else {
        res.status(200).json(apiRes);
      }
    } catch (error) {
      const { httpStatus, message } =
        (error as Error).name === "RequestError"
          ? (error as RequestError)
          : ({ ...(error as Error), httpStatus: 500 } satisfies RequestError);

      if (dataStreamer.connected) {
        dataStreamer.disconnect();
      }

      return sendErrorResponse({
        res,
        reqId,
        httpStatus,
        errorMessage: message,
      });
    }
  };
}

export interface GetContentForTextParams {
  embed: EmbedFunc;
  ipAddress: string;
  text: string;
  store: EmbeddedContentStore;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
}

export async function sendStaticNonResponse({
  conversations,
  conversationId,
  preprocessedUserMessageContent,
  latestMessageText,
  shouldStream,
  dataStreamer,
  res,
  rejectQuery,
}: {
  conversations: ConversationsService;
  conversationId: ObjectId;
  rejectQuery?: boolean;
  preprocessedUserMessageContent?: string;
  latestMessageText: string;
  shouldStream: boolean;
  dataStreamer: DataStreamer;
  res: ExpressResponse<ApiMessage>;
}) {
  const { assistantMessage } = await addMessagesToDatabase({
    conversations,
    conversationId,
    rejectQuery,
    preprocessedUserMessageContent: preprocessedUserMessageContent,
    originalUserMessageContent: latestMessageText,
    assistantMessageContent: conversationConstants.NO_RELEVANT_CONTENT,
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
  message: Message
): OpenAiChatMessage {
  return {
    content: message.content,
    role: message.role as OpenAiMessageRole,
  };
}

export async function getContentForText({
  embed,
  store,
  text,
  ipAddress,
  findNearestNeighborsOptions,
}: GetContentForTextParams) {
  const { embedding } = await embed({
    text,
    userIp: ipAddress,
  });

  const results = await store.findNearestNeighbors(
    embedding,
    findNearestNeighborsOptions
  );
  return { embedding, results };
}

interface AddMessagesToDatabaseParams {
  conversationId: ObjectId;
  originalUserMessageContent: string;
  preprocessedUserMessageContent?: string;
  assistantMessageContent: string;
  assistantMessageReferences: References;
  conversations: ConversationsService;
  userMessageEmbedding?: number[];
  rejectQuery?: boolean;
}
export async function addMessagesToDatabase({
  conversationId,
  originalUserMessageContent,
  preprocessedUserMessageContent,
  assistantMessageContent,
  assistantMessageReferences,
  conversations,
  userMessageEmbedding,
  rejectQuery,
}: AddMessagesToDatabaseParams) {
  // TODO: consider refactoring addConversationMessage to take in an array of messages.
  // Would limit database calls.
  const userMessage = await conversations.addConversationMessage({
    conversationId,
    content: originalUserMessageContent,
    preprocessedContent: preprocessedUserMessageContent,
    role: "user",
    embedding: userMessageEmbedding,
    rejectQuery,
  });
  const assistantMessage = await conversations.addConversationMessage({
    conversationId,
    content: assistantMessageContent,
    role: "assistant",
    references: assistantMessageReferences,
  });
  return { userMessage, assistantMessage };
}

export const createLinkReference = (link: string): Reference => {
  const url = new URL(link);
  url.searchParams.append("tck", "docs_chatbot");
  return {
    url: url.href,
    title: url.origin + url.pathname,
  };
};

export interface GenerateReferencesParams {
  chunks: EmbeddedContent[];
}

export function generateReferences({
  chunks,
}: GenerateReferencesParams): References {
  if (chunks.length === 0) {
    return [];
  }
  const uniqueLinks = Array.from(new Set(chunks.map((chunk) => chunk.url)));
  return uniqueLinks.map((link) => createLinkReference(link));
}

/**
  This function will return the chunks that can fit in the maxTokens.
  It limits the number of tokens that are sent to the LLM.
 */
export function includeChunksForMaxTokensPossible({
  maxTokens,
  chunks,
}: {
  maxTokens: number;
  chunks: EmbeddedContent[];
}): EmbeddedContent[] {
  let total = 0;
  const fitRangeEndIndex = chunks.findIndex(
    ({ tokenCount }) => (total += tokenCount) > maxTokens
  );
  return fitRangeEndIndex === -1 ? chunks : chunks.slice(0, fitRangeEndIndex);
}

export function validateApiConversationFormatting({
  conversation,
}: {
  conversation: ApiConversation;
}) {
  const { messages } = conversation;
  if (
    messages?.length === 0 || // Must be messages in the conversation
    messages.length % 2 !== 0 // Must be an even number of messages
  ) {
    return false;
  }
  // Must alternate between assistant and user
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const isAssistant = i % 2 === 0;
    if (isAssistant && message.role !== "assistant") {
      return false;
    }
    if (!isAssistant && message.role !== "user") {
      return false;
    }
  }

  return true;
}
