import { stripIndents } from "common-tags";
import { strict as assert } from "assert";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { SystemMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  ConversationsService,
  Conversation,
  SomeMessage,
  makeDataStreamer,
  ChatLlm,
} from "mongodb-rag-core";
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
import { generateResponse } from "../generateResponse";

export const DEFAULT_MAX_INPUT_LENGTH = 3000; // magic number for max input size for LLM
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
  /**
    If present, the route will create a new conversation
    when given the `conversationIdPathParam` in the URL.
   */
  createConversation?: {
    /**
      Create a new conversation when the `conversationId` is the string "null".
     */
    createOnNullConversationId: boolean;
    /**
      The custom data to add to the new conversation
      when it is created.
     */
    addCustomData?: AddCustomDataFunc;
    /**
      The system message to add to the new conversation
      when it is created.
     */
    systemMessage?: SystemMessage;
  };
}

export function makeAddMessageToConversationRoute({
  conversations,
  llm,
  generateUserPrompt,
  maxInputLengthCharacters = DEFAULT_MAX_INPUT_LENGTH,
  maxUserMessagesInConversation = DEFAULT_MAX_USER_MESSAGES_IN_CONVERSATION,
  filterPreviousMessages = filterOnlySystemPrompt,
  addMessageToConversationCustomData,
  createConversation,
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
        createConversation,
        reqId,
        req,
        res,
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
      if (shouldStream) {
        dataStreamer.connect(res);
      }

      // --- GENERATE RESPONSE  ---
      // TODO: make sure we are returning the new user message too
      const { messages } = await generateResponse({
        llm,
        conversation,
        latestMessageText,
        generateUserPrompt,
        filterPreviousMessages,
        customData,
        dataStreamer,
        shouldStream,
        reqId,
        llmNotWorkingMessage:
          conversations.conversationConstants.LLM_NOT_WORKING,
        noRelevantContentMessage:
          conversations.conversationConstants.NO_RELEVANT_CONTENT,
      });

      // --- SAVE QUESTION & RESPONSE ---
      const dbNewMessages = await addMessagesToDatabase({
        conversations,
        conversation,
        messages,
      });
      const dbAssistantMessage = dbNewMessages[dbNewMessages.length - 1];

      assert(dbAssistantMessage !== undefined, "No assistant message found");
      const apiRes = convertMessageFromDbToApi(
        dbAssistantMessage,
        conversation._id
      );

      if (!shouldStream) {
        return res.status(200).json(apiRes);
      } else {
        dataStreamer.streamData({
          type: "metadata",
          data: { conversationId: conversation._id.toString() },
        });
        dataStreamer.streamData({
          type: "finished",
          data: apiRes.id,
        });
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
  createConversation,
  reqId,
  req,
  res,
}: {
  conversationIdString: string;
  conversations: ConversationsService;
  createConversation?: AddMessageToConversationRouteParams["createConversation"];
  reqId: string;
  req: ExpressRequest;
  res: ExpressResponse<ApiMessage, ConversationsRouterLocals>;
}) => {
  // Create a new conversation if the conversationId is "null"
  // and the route is configured to do so
  if (
    createConversation?.createOnNullConversationId === true &&
    conversationIdString === "null"
  ) {
    logRequest({
      reqId,
      message: stripIndents`Creating new conversation`,
    });
    return await conversations.create({
      initialMessages: createConversation.systemMessage
        ? [createConversation.systemMessage]
        : undefined,
      customData: createConversation.addCustomData
        ? await createConversation.addCustomData(req, res)
        : undefined,
    });
  }

  // Throw if the conversationId is not a valid ObjectId
  const conversationId = ObjectId.isValid(conversationIdString)
    ? ObjectId.createFromHexString(conversationIdString)
    : (() => {
        throw makeRequestError({
          httpStatus: 400,
          message: `Invalid conversationId: ${conversationIdString}`,
        });
      })();

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
