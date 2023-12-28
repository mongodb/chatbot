import { stripIndents } from "common-tags";
import { strict as assert } from "assert";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { ObjectId, References } from "mongodb-rag-core";
import {
  ConversationsService,
  Conversation,
  SomeMessage,
  UserMessage,
  AssistantMessage,
} from "../../services/ConversationsService";
import { DataStreamer } from "../../services/dataStreamer";
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
import {
  AddCustomDataFunc,
  ConversationsRouterLocals,
} from "./conversationsRouter";
import { GenerateUserPromptFunc } from "../../processors/GenerateUserPromptFunc";

export const DEFAULT_MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM
export const DEFAULT_MAX_MESSAGES_IN_CONVERSATION = 13; // magic number for max messages in a conversation

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
  generateUserPrompt?: GenerateUserPromptFunc;
  dataStreamer: DataStreamer;
  maxInputLengthCharacters?: number;
  maxMessagesInConversation?: number;
  addMessageToConversationCustomData?: AddCustomDataFunc;
}

export function makeAddMessageToConversationRoute({
  conversations,
  llm,
  dataStreamer,
  generateUserPrompt,
  maxInputLengthCharacters = DEFAULT_MAX_INPUT_LENGTH,
  maxMessagesInConversation = DEFAULT_MAX_MESSAGES_IN_CONVERSATION,
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

      // --- DETERMINE IF SHOULD STREAM ---
      const shouldStream = Boolean(stream);

      // --- GENERATE USER MESSAGE ---
      const { userMessage, references } = await (generateUserPrompt
        ? generateUserPrompt({
            userMessageText: latestMessageText,
            conversation,
            reqId,
            customData,
          })
        : {
            userMessage: {
              role: "user",
              content: latestMessageText,
              customData,
            } satisfies UserMessage,
          });
      const { rejectQuery } = userMessage;
      const newMessages = [userMessage];
      if (rejectQuery) {
        const rejectMessage = {
          role: "assistant",
          content: conversations.conversationConstants.NO_RELEVANT_CONTENT,
        } satisfies AssistantMessage;

        const messages = [...newMessages, rejectMessage];
        return sendStaticNonResponse({
          conversations,
          conversation,
          shouldStream,
          dataStreamer,
          res,
          messages,
        });
      }

      const llmConversation = [...conversation.messages, ...newMessages].map(
        convertConversationMessageToLlmMessage
      );

      // --- GENERATE RESPONSE ---
      // EAI-121_PART_2_TODO: refactor to include N messages
      // rather than take the conversation, take previous messages, and newMessages.
      // manipulate the newMessages object in generated response.
      // return newMessages
      const answerContent = await generateResponse({
        shouldStream,
        llm,
        llmConversation,
        dataStreamer,
        res,
        references,
        reqId,
        llmNotWorkingMessage:
          conversations.conversationConstants.LLM_NOT_WORKING,
      });

      // EAI-121_PART_2_TODO: with refactor to make generateResponse return newMessages,
      // i don't think this is needed anymore.
      if (!answerContent) {
        throw makeRequestError({
          httpStatus: 500,
          message: "No answer content",
        });
      }

      // --- SAVE QUESTION & RESPONSE ---
      const dbNewMessages = await addMessagesToDatabase({
        conversations,
        conversation,
        messages: newMessages,
      });

      const assistantMessage = dbNewMessages.pop();
      assert(assistantMessage !== undefined, "No assistant message found");
      const apiRes = convertMessageFromDbToApi(assistantMessage);

      if (!shouldStream) {
        return res.status(200).json(apiRes);
      }
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

// --- HELPERS ---

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
  messages,
  shouldStream,
  dataStreamer,
  res,
}: {
  conversations: ConversationsService;
  conversation: Conversation;
  messages: SomeMessage[];
  shouldStream: boolean;
  dataStreamer: DataStreamer;
  res: ExpressResponse<ApiMessage>;
}) {
  const dbMessages = await addMessagesToDatabase({
    conversations,
    conversation,
    messages,
  });
  const assistantMessage = dbMessages.pop();
  assert(
    assistantMessage !== undefined && assistantMessage.role === "assistant",
    "No assistant message found"
  );
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

interface GenerateResponseParams {
  shouldStream: boolean;
  llm: ChatLlm;
  llmConversation: OpenAiChatMessage[];
  dataStreamer: DataStreamer;
  res: ExpressResponse<ApiMessage>;
  references?: References;
  reqId: string;
  llmNotWorkingMessage: string;
}
async function generateResponse({
  shouldStream,
  llm,
  llmConversation,
  dataStreamer,
  res,
  references,
  reqId,
  llmNotWorkingMessage,
}: GenerateResponseParams) {
  if (shouldStream) {
    const answerStream = await llm.answerQuestionStream({
      messages: llmConversation,
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
      data: references ?? [],
    });
    return answerContent;
  }

  try {
    logRequest({
      reqId,
      message: `LLM query: ${JSON.stringify(llmConversation)}`,
    });
    // --- GENERATE RESPONSE ---
    const answer = await llm.answerQuestionAwaited({
      messages: llmConversation,
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
      reqId,
      message: `LLM error: ${errorMessage}`,
      type: "error",
    });
    logRequest({
      reqId,
      message: "Only sending vector search results to user",
    });
    const answer = {
      role: "assistant",
      content: llmNotWorkingMessage,
    } satisfies OpenAiChatMessage;
    return answer.content;
  }
}

function convertConversationMessageToLlmMessage(
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
  conversations: ConversationsService;
  messages: SomeMessage[];
}

async function addMessagesToDatabase({
  conversation,
  conversations,
  messages,
}: AddMessagesToDatabaseParams) {
  const conversationId = conversation._id;
  const dbMessages = await conversations.addManyConversationMessages({
    conversationId,
    messages,
  });
  return dbMessages;
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
