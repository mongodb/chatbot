import { stripIndents } from "common-tags";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import {
  ObjectId,
  EmbeddedContent,
  FunctionDefinition,
  logger,
} from "chat-core";
import {
  Message,
  SomeMessage,
  conversationConstants,
} from "../../services/conversations";
import { OpenAiChatMessage, OpenAiMessageRole } from "../../services/ChatLlm";
import {
  ConversationForApi,
  ApiMessage,
  convertMessageFromDbToApi,
  isValidIp,
} from "./utils";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";
import { FindContentFunc } from "./FindContentFunc";
import {
  ApiConversationsService,
  ApiConversation,
  BaseMessage,
} from "../../services/ApiConversations";
import { ApiChatLlm } from "../../services/ApiChatLlm";

export const MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM
export const MAX_MESSAGES_IN_CONVERSATION = 100; // magic number for max messages in a conversation

// SKUNK_TODO: get project, org and cluster Ids from the user input
/**
 * The API credentials are a map of API names to API keys and secrets.
 * e.g.
 * {
 *   "atlas-admin-api": {
 *     publicKey: "<Public Key>",
 *     privateKey: "<Private Key>",
 *     organizationId: "<Org ID>",
 *     projectId: "<Project ID>",
 *     clusterId: "<Project ID>",
 *   }
 * }
 */
export type ApiCredentials = z.infer<typeof ApiCredentials>;
export const ApiCredentials = z.record(z.record(z.string()));

export type AddApiMessageRequestBody = z.infer<typeof AddApiMessageRequestBody>;
export const AddApiMessageRequestBody = z.object({
  message: z.string(),
  apiCredentials: ApiCredentials,
});

export const AddApiMessageRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    params: z.object({
      conversationId: z.string(),
    }),
    query: z.object({
      // stream: z.string().optional(), // TODO - out of scope for skunkworks
    }),
    body: AddApiMessageRequestBody,
    ip: z.string(),
  })
);

export type AddApiMessageRequest = z.infer<typeof AddApiMessageRequest>;

export interface AddApiMessageRouteParams {
  conversations: ApiConversationsService;
  llm: ApiChatLlm;
  maxChunkContextTokens?: number;
  findContent: FindContentFunc;
}

export type RequestError = Error & {
  name: "RequestError";
  httpStatus: number;
};

export const makeRequestError = ({
  message,
  httpStatus,
  stack: stackIn,
}: Omit<RequestError, "name">): RequestError => {
  const stack = stackIn ?? new Error(message).stack;
  return {
    stack,
    message,
    httpStatus,
    name: "RequestError",
  };
};

export function makeAddApiMessageRoute({
  conversations,
  llm,
}: AddApiMessageRouteParams) {
  return async (
    req: ExpressRequest<AddApiMessageRequest["params"]>,
    res: ExpressResponse<ApiMessage>
  ) => {
    const reqId = getRequestId(req);
    try {
      const {
        params: { conversationId: conversationIdString },
        body: { message, apiCredentials },
        // query,
        ip,
      } = req;
      logRequest({
        reqId,
        message: stripIndents`Request info:
          message: ${message}
          apiCredentials: ${apiCredentials}
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
      const conversation = await loadConversation({
        conversationIdString,
        conversations,
      });

      // --- MAX CONVERSATION LENGTH CHECK ---
      if (conversation.messages.length >= MAX_MESSAGES_IN_CONVERSATION) {
        // Omit the system prompt and assume the user always received one response per message
        const maxUserMessages = (MAX_MESSAGES_IN_CONVERSATION - 1) / 2;
        throw makeRequestError({
          httpStatus: 400,
          message: `Too many messages. You cannot send more than ${maxUserMessages} messages in this conversation.`,
        });
      }

      // --- PREPROCESS ---
      // TODO - User query preprocessing is out of scope for skunkworks
      const query = latestMessageText;

      const latestMessage = {
        content: query,
        role: "user",
        functions:
          conversation.messages[conversation.messages.length - 1].functions,
      } satisfies OpenAiChatMessage;
      logRequest({
        reqId,
        message: `Latest message sent to LLM: ${JSON.stringify(latestMessage)}`,
      });

      // --- GENERATE RESPONSE ---

      let newMessages = [...conversation.messages, latestMessage].map(
        convertDbMessageToOpenAiMessage
      ) as OpenAiChatMessage[];
      try {
        logRequest({
          reqId,
          message: `LLM query: ${JSON.stringify(newMessages)}`,
        });
        // --- GENERATE RESPONSE ---
        // TODO - this is where the skunk magic happens
        //  - call the LLM

        const atlasCredentials = apiCredentials["atlas-admin-api"];
        console.log("new msgs::", newMessages);

        newMessages = await runLlmQuery({
          messages: newMessages,
          llm,
          atlasCredentials,
        });

        while (newMessages[newMessages.length - 1].role === "function") {
          const lastMessage = newMessages[newMessages.length - 1];
          // keep executing llm.answerAwaited until we get a message that is not a function
          if (!lastMessage.content) {
            console.log(
              "\nUH OH WE GOTTA FIX THIS\n\nlastMessage.content is null but should be a string!\n",
              lastMessage,
              "\n\n"
            );
          }
          newMessages = await runLlmQuery({
            messages: newMessages,
            llm,
            atlasCredentials,
          });
        }
        // messagesAfterResponseFinished = newMessages;
        // --- SAVE QUESTION(s) & RESPONSE ---
        console.log("messagesAfterResponseFinished", newMessages);
        const savedMessages = await pushMessagesToDatabase({
          conversations,
          conversation,
          messages: newMessages,
        });
        console.log("savedMessages", savedMessages);
        const assistantMessage = savedMessages
          .slice()
          .reverse()
          .find((m) => m.role === "assistant");
        if (!assistantMessage) {
          throw makeRequestError({
            httpStatus: 500,
            message: "No assistant message found when there should be one",
          });
        }
        const apiRes = convertMessageFromDbToApi(assistantMessage);

        return res.status(200).json(apiRes);
      } catch (err) {
        logger.error(`Error: ${err}`);
        const errorMessage =
          err instanceof Error ? err.message : JSON.stringify(err);
        logRequest({
          reqId: req.headers["req-id"] as string,
          message: `LLM error: ${errorMessage}`,
          type: "error",
        });
        // @ts-ignore
        res.status(500).send({ error: errorMessage });
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
    }
  };
}

async function runLlmQuery({
  messages,
  llm,
  atlasCredentials,
}: {
  atlasCredentials: Record<string, string>;
  messages: OpenAiChatMessage[];
  llm: ApiChatLlm;
}) {
  const { newMessages } = await llm.answerAwaited({
    messages,
    staticHttpRequestArgs: {
      pathParameters: {
        orgId: atlasCredentials.organizationId,
        groupId: atlasCredentials.projectId,
        clusterName: atlasCredentials.clusterId,
      },
      headers: {
        Accept: "application/vnd.atlas.2023-02-01+json",
      },
    },
    apiCredentials: {
      type: "digest",
      username: atlasCredentials.publicApiKey,
      password: atlasCredentials.privateApiKey,
    },
  });
  return newMessages;
}

export function convertDbMessageToOpenAiMessage(
  message: OpenAiChatMessage
): OpenAiChatMessage {
  return {
    content: message.content,
    role: message.role as OpenAiMessageRole,
    name: message.name ?? undefined,
    functionCall: message.functionCall ?? undefined,
    functions: message.functions ?? undefined,
  };
}

// TODO - This doesn't support pushing to db with functions, we gotta fix?
interface PushMessagesToDatabaseParams {
  conversations: ApiConversationsService;
  conversation: ApiConversation;
  messages: OpenAiChatMessage[];
}

export async function pushMessagesToDatabase({
  conversations,
  conversation,
  messages,
}: PushMessagesToDatabaseParams) {
  const conversationId = conversation._id;
  const newMessages = await conversations.addApiConversationMessages({
    conversationId,
    messages: messages.map((message) => ({
      content: message.content ?? "",
      role: message.role,
      functions: message.functions,
      name: message.name,
      functionCall: message.functionCall,
    })),
  });
  return newMessages;
}

const loadConversation = async ({
  conversationIdString,
  conversations,
}: {
  conversationIdString: string;
  conversations: ApiConversationsService;
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
