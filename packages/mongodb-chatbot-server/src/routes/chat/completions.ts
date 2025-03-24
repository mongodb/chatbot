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
} from "../utils";
import { logRequest, sendErrorResponse } from "../../../utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../../middleware/validateRequestSchema";
import {
  AddCustomDataFunc,
  ConversationsRouterLocals,
} from "../conversationsRouter";
import { GenerateUserPromptFunc } from "../../../processors/GenerateUserPromptFunc";
import { FilterPreviousMessages } from "../../../processors/FilterPreviousMessages";
import { filterOnlySystemPrompt } from "../../../processors/filterOnlySystemPrompt";
import {
  generateResponse,
  GenerateResponseParams,
} from "../../generateResponse";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { UpdateTraceFunc, updateTraceIfExists } from "../UpdateTraceFunc";

export const DEFAULT_MAX_INPUT_LENGTH = 30000; // magic number for max input size for LLM
export const DEFAULT_MAX_MESSAGES = 7; // magic number for max messages in a conversation

export type ChatCompletionRequestBody = z.infer<
  typeof ChatCompletionRequestBody
>;
export const ChatCompletionRequestBody = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

export const ChatCompletionRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    query: z.object({
      stream: z.string().optional(),
    }),
    body: ChatCompletionRequestBody,
  })
);

export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequest>;

export interface ChatCompletionRouteParams {
  conversations: ConversationsService;
  llm: ChatLlm;
  generateUserPrompt?: GenerateUserPromptFunc;
  filterPreviousMessages?: FilterPreviousMessages;
  maxInputLengthCharacters?: number;
  maxMessages?: number;
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

  /**
    Custom function to update the Braintrust tracing
    after the response has been sent to the user.
    Can add additional tags, scores, etc.
   */
  updateTrace?: UpdateTraceFunc;
}

type MakeTracedResponseParams = Pick<
  GenerateResponseParams,
  | "latestMessageText"
  | "customData"
  | "dataStreamer"
  | "shouldStream"
  | "reqId"
  | "conversation"
>;

export function makeAddMessageToConversationRoute({
  conversations,
  llm,
  generateUserPrompt,
  maxInputLengthCharacters = DEFAULT_MAX_INPUT_LENGTH,
  maxMessages = DEFAULT_MAX_MESSAGES,
  filterPreviousMessages = filterOnlySystemPrompt,
  updateTrace,
}: ChatCompletionRouteParams) {
  const generateResponseTraced = function ({
    latestMessageText,
    customData,
    dataStreamer,
    shouldStream,
    reqId,
    conversation,
    traceId,
  }: MakeTracedResponseParams & { traceId: string }) {
    const tracedFunc = wrapTraced(
      ({
        latestMessageText,
        customData,
        dataStreamer,
        shouldStream,
        reqId,
        conversation,
      }: MakeTracedResponseParams) => {
        return generateResponse({
          latestMessageText,
          customData,
          dataStreamer,
          shouldStream,
          reqId,
          llm,
          conversation,
          generateUserPrompt,
          filterPreviousMessages,
          llmNotWorkingMessage:
            conversations.conversationConstants.LLM_NOT_WORKING,
          noRelevantContentMessage:
            conversations.conversationConstants.NO_RELEVANT_CONTENT,
        });
      },
      {
        name: "generateCompletion",
        event: {
          id: traceId,
          metadata: {
            conversationId: conversation._id.toHexString(),
          },
        },
      }
    );
    return tracedFunc({
      latestMessageText,
      customData,
      dataStreamer,
      shouldStream,
      reqId,
      conversation,
    });
  };
  return async (
    req: ExpressRequest<ChatCompletionRequest["params"]>,
    res: ExpressResponse<ApiMessage, ConversationsRouterLocals>
  ) => {
    const dataStreamer = makeDataStreamer();
    const parsedReq = ChatCompletionRequest.parse(req);
    const reqId = parsedReq.headers["req-id"];
    const { ip } = req;
    try {
      const {
        body: { messages },
        query: { stream },
      } = parsedReq;
      logRequest({
        reqId,
        message: stripIndents`Request info:
          Message: ${messages}
          Stream: ${stream}
          IP: ${ip}`,
      });

      if (
        messages.reduce(
          (acc: number, message: { content: string }) =>
            acc + message.content.length,
          0
        ) > maxInputLengthCharacters
      ) {
        throw makeRequestError({
          httpStatus: 400,
          message: "Message too long",
        });
      }

      // --- MAX CONVERSATION LENGTH CHECK ---
      if (messages.length >= maxMessages) {
        // Omit the system prompt and assume the user always received one response per message
        throw makeRequestError({
          httpStatus: 400,
          message: `Too many messages. You cannot send more than ${maxMessages} messages in this conversation.`,
        });
      }

      // --- DETERMINE IF SHOULD STREAM ---
      const shouldStream = Boolean(stream);
      if (shouldStream) {
        dataStreamer.connect(res);
      }

      const assistantResponseMessageId = new ObjectId();
      const conversation: Conversation = {
        _id: new ObjectId(),
        createdAt: new Date(),
        messages: messages.slice(0, -1).map((m) => ({
          id: new ObjectId(),
          createdAt: new Date(),
          ...m,
        })),
      };
      const latestMessageText = messages[messages.length - 1].content;

      const { messages: tracedResponseMessages } = await generateResponseTraced(
        {
          conversation,
          latestMessageText,
          dataStreamer,
          shouldStream,
          reqId,
          traceId: assistantResponseMessageId.toHexString(),
        }
      );

      // --- SAVE QUESTION & RESPONSE ---
      const dbNewMessages = await addMessagesToDatabase({
        conversations,
        conversation,
        messages: tracedResponseMessages,
        assistantResponseMessageId,
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
        if (dataStreamer.connected) {
          dataStreamer.disconnect();
        }

        await updateTraceIfExists({
          updateTrace,
          conversations,
          conversationId: conversation._id,
          assistantResponseMessageId: dbAssistantMessage.id,
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
  assistantResponseMessageId: ObjectId;
}

async function addMessagesToDatabase({
  conversation,
  conversations,
  messages,
  assistantResponseMessageId,
}: AddMessagesToDatabaseParams) {
  (
    messages as Parameters<
      typeof conversations.addManyConversationMessages
    >[0]["messages"]
  )[messages.length - 1].id = assistantResponseMessageId;

  const conversationId = conversation._id;
  const dbMessages = await conversations.addManyConversationMessages({
    conversationId,
    messages,
  });
  return dbMessages;
}
