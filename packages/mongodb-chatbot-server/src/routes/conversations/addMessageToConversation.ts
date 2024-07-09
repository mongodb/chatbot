import { stripIndents } from "common-tags";
import { strict as assert } from "assert";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { ObjectId } from "mongodb-rag-core";
import {
  ConversationsService,
  Conversation,
  SomeMessage,
  UserMessage,
  AssistantMessage,
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
import {
  AddCustomDataFunc,
  ConversationsRouterLocals,
} from "./conversationsRouter";
import { GenerateUserPromptFunc } from "../../processors/GenerateUserPromptFunc";
import { FilterPreviousMessages } from "../../processors/FilterPreviousMessages";
import { filterOnlySystemPrompt } from "../../processors/filterOnlySystemPrompt";
import {
  convertMessageFromLlmToDb,
  generateResponse,
} from "../generateResponse";

export const DEFAULT_MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM
export const DEFAULT_MAX_USER_MESSAGES_IN_CONVERSATION = 7; // magic number for max messages in a conversation

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
  filterPreviousMessages?: FilterPreviousMessages;
  maxInputLengthCharacters?: number;
  maxUserMessagesInConversation?: number;
  addMessageToConversationCustomData?: AddCustomDataFunc;
}

export function makeAddMessageToConversationRoute({
  conversations,
  llm,
  generateUserPrompt,
  maxInputLengthCharacters = DEFAULT_MAX_INPUT_LENGTH,
  maxUserMessagesInConversation = DEFAULT_MAX_USER_MESSAGES_IN_CONVERSATION,
  filterPreviousMessages = filterOnlySystemPrompt,
  addMessageToConversationCustomData,
}: AddMessageToConversationRouteParams) {
  return async (
    req: ExpressRequest<AddMessageRequest["params"]>,
    res: ExpressResponse<ApiMessage, ConversationsRouterLocals>
  ) => {
    const dataStreamer = makeDataStreamer();
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
      const numUserMessages = conversation.messages.reduce(
        (acc, message) => (message.role === "user" ? acc + 1 : acc),
        0
      );
      if (numUserMessages >= maxUserMessagesInConversation) {
        // Omit the system prompt and assume the user always received one response per message
        throw makeRequestError({
          httpStatus: 400,
          message: `Too many messages. You cannot send more than ${maxUserMessagesInConversation} messages in this conversation.`,
        });
      }

      // --- DETERMINE IF SHOULD STREAM ---
      const shouldStream = Boolean(stream);

      // --- GENERATE USER MESSAGE ---
      const { userMessage, references, staticResponse, rejectQuery } =
        await (generateUserPrompt
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
      // Add request custom data to user message.
      const userMessageWithCustomData = customData
        ? {
            ...userMessage,
            // Override request custom data fields with user message custom data fields.
            customData: { ...customData, ...(userMessage.customData ?? {}) },
          }
        : userMessage;
      const newMessages: SomeMessage[] = [userMessageWithCustomData];
      if (rejectQuery || staticResponse !== undefined) {
        const rejectionMessage = {
          role: "assistant",
          content: conversations.conversationConstants.NO_RELEVANT_CONTENT,
          references: references ?? [],
        } satisfies AssistantMessage;
        const messages = [...newMessages, staticResponse ?? rejectionMessage];
        sendStaticResponse({
          conversations,
          conversation,
          shouldStream,
          dataStreamer,
          res,
          messages,
        });
      } else {
        const llmConversation = [
          ...(await filterPreviousMessages(conversation)).map(
            convertConversationMessageToLlmMessage
          ),
          ...newMessages.map((m) => {
            // Use transformed content if it exists for user message,
            // otherwise use original content.
            if (m.role === "user") {
              return {
                content: m.contentForLlm ?? m.content,
                role: "user",
              } satisfies OpenAiChatMessage;
            }
            return convertConversationMessageToLlmMessage(m);
          }),
        ];

        // --- GENERATE RESPONSE ---
        if (shouldStream) {
          dataStreamer.connect(res);
        }

        const { messages: generatedMessages } = await generateResponse({
          shouldStream,
          llm,
          llmConversation,
          dataStreamer,
          references,
          reqId,
          llmNotWorkingMessage:
            conversations.conversationConstants.LLM_NOT_WORKING,
          noRelevantContentMessage:
            conversations.conversationConstants.NO_RELEVANT_CONTENT,
          request: req,
        });

        // --- SAVE QUESTION & RESPONSE ---
        const dbNewMessages = await addMessagesToDatabase({
          conversations,
          conversation,
          messages: [
            ...newMessages,
            ...generatedMessages.map((m) => convertMessageFromLlmToDb(m)),
          ],
        });
        const dbAssistantMessage = dbNewMessages[dbNewMessages.length - 1];

        assert(dbAssistantMessage !== undefined, "No assistant message found");
        const apiRes = convertMessageFromDbToApi(dbAssistantMessage);

        if (!shouldStream) {
          return res.status(200).json(apiRes);
        } else {
          dataStreamer.streamData({
            type: "finished",
            data: apiRes.id,
          });
        }
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

      sendErrorResponse({
        res,
        reqId,
        httpStatus,
        errorMessage: message,
      });
    } finally {
      if (dataStreamer.connected) {
        dataStreamer.disconnect();
      }
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

async function sendStaticResponse({
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
    const { metadata, references } = apiRes;

    dataStreamer.connect(res);

    if (metadata) {
      dataStreamer.streamData({
        type: "metadata",
        data: metadata,
      });
    }

    dataStreamer.streamData({
      type: "delta",
      data: apiRes.content,
    });

    if (references && references.length > 0) {
      dataStreamer.streamData({
        type: "references",
        data: references,
      });
    }

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
