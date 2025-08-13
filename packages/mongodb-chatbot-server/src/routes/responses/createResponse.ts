import { z } from "zod";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { ObjectId } from "mongodb";
import {
  type ConversationsService,
  type Conversation,
  type ResponseStreamCreated,
  type ResponseStreamInProgress,
  type ResponseStreamCompleted,
  type ResponseStreamError,
  makeDataStreamer,
  Message,
} from "mongodb-rag-core";
import { SomeExpressRequest } from "../../middleware";
import { getRequestId, makeTraceConversation } from "../../utils";
import type { GenerateResponse } from "../../processors";
import {
  makeBadRequestError,
  makeInternalServerError,
  generateZodErrorMessage,
  sendErrorResponse,
  ERROR_TYPE,
  type SomeOpenAIAPIError,
} from "./errors";
import { traced, wrapNoTrace, wrapTraced } from "mongodb-rag-core/braintrust";
import {
  UpdateTraceFunc,
  updateTraceIfExists,
} from "../../processors/UpdateTraceFunc";

export const MIN_INSTRUCTIONS_LENGTH = 1;
export const MAX_INSTRUCTIONS_LENGTH = 50000; // ~10,000 tokens

export const MIN_INPUT_LENGTH = 1;
export const MAX_INPUT_LENGTH = 250000; // ~50,000 tokens

export const MAX_INPUT_ARRAY_LENGTH = 50;

export const MAX_TOOLS = 10;
export const MAX_TOOLS_CONTENT_LENGTH = 25000; // ~5,000 tokens

export const CREATE_RESPONSE_ERR_MSG = {
  INSTRUCTIONS_LENGTH: `Instructions must be between ${MIN_INSTRUCTIONS_LENGTH} and ${MAX_INSTRUCTIONS_LENGTH} characters, inclusive.`,
  INPUT_STRING: "Input must be a non-empty string",
  INPUT_LENGTH: `Input must be between ${MIN_INPUT_LENGTH} and ${MAX_INPUT_LENGTH} characters, inclusive.`,
  INPUT_ARRAY:
    "Input must be a string or array of messages. See https://platform.openai.com/docs/api-reference/responses/create#responses-create-input for more information.",
  INPUT_ARRAY_LENGTH: `Input array must have at most ${MAX_INPUT_ARRAY_LENGTH} element(s).`,
  INPUT_TEXT_ARRAY:
    'Input content array only supports "input_text" type with exactly one element.',
  INPUT_ASSISTANT_CONTENT_ARRAY:
    'Input content array only supports "output_text" type with exactly one element.',
  TOOLS_LENGTH: `Input tools array must have at most ${MAX_TOOLS} element(s).`,
  TOOLS_CONTENT_LENGTH: `Input tools array must have at most ${MAX_TOOLS_CONTENT_LENGTH} characters, inclusive.`,
  CONVERSATION_USER_ID_CHANGED:
    "Path: body.user - User ID has changed since the conversation was created.",
  METADATA_LENGTH: "Too many metadata fields. Max 16.",
  METADATA_CONVERSATION_ID_NOT_ALLOWED:
    "The 'conversation_id' key is not allowed in metadata",
  TEMPERATURE: "Temperature must be 0 or unset",
  STREAM: "'stream' must be true",
  INVALID_OBJECT_ID: (id: string) =>
    `Path: body.previous_response_id - ${id} is not a valid ObjectId`,
  MESSAGE_NOT_FOUND: (messageId: string) =>
    `Path: body.previous_response_id - Message ${messageId} not found`,
  MESSAGE_NOT_LATEST: (messageId: string) =>
    `Path: body.previous_response_id - Message ${messageId} is not the latest message in the conversation`,
  TOO_MANY_MESSAGES: (max: number) =>
    `Too many messages. You cannot send more than ${max} messages in this conversation.`,
  MODEL_NOT_SUPPORTED: (model: string) =>
    `Path: body.model - ${model} is not supported.`,
  MAX_OUTPUT_TOKENS: (input: number, max: number) =>
    `Path: body.max_output_tokens - ${input} is greater than the maximum allowed ${max}.`,
  STORE_NOT_SUPPORTED:
    "Path: body.previous_response_id | body.store - to use previous_response_id the store flag must be true",
  CONVERSATION_STORE_MISMATCH:
    "Path: body.previous_response_id | body.store - the conversation store flag does not match the store flag provided",
} as const;

const SystemMessageSchema = z.object({
  type: z.literal("message").optional(),
  role: z.literal("system"),
  content: z.string(),
});

const UserMessageSchema = z.object({
  type: z.literal("message").optional(),
  role: z.literal("user"),
  content: z.union([
    z.string(),
    z
      .array(
        z.object({
          type: z.literal("input_text"),
          text: z.string(),
        })
      )
      .length(1, CREATE_RESPONSE_ERR_MSG.INPUT_TEXT_ARRAY),
  ]),
});

const AssistantMessageSchema = z.object({
  type: z.literal("message").optional(),
  role: z.literal("assistant"),
  content: z.union([
    z.string(),
    z
      .array(
        z.object({
          type: z.literal("output_text"),
          text: z.string(),
        })
      )
      .length(1, CREATE_RESPONSE_ERR_MSG.INPUT_ASSISTANT_CONTENT_ARRAY),
  ]),
});

const InputMessageSchema = z.union([
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessageSchema,
]);

type InputMessage = z.infer<typeof InputMessageSchema>;
type UserMessage = z.infer<typeof UserMessageSchema>;

const FunctionCallSchema = z.object({
  type: z.literal("function_call"),
  call_id: z.string().describe("Unique ID of the function tool call"),
  name: z.string().describe("Name of the function tool to call"),
  arguments: z
    .string()
    .describe("JSON string of arguments passed to the function tool call"),
  status: z.enum(["in_progress", "completed", "incomplete"]),
});

const FunctionCallOutputSchema = z.object({
  type: z.literal("function_call_output"),
  id: z
    .string()
    .optional()
    .describe("The unique ID of the function tool call output"),
  call_id: z
    .string()
    .describe("Unique ID of the function tool call generated by the model"),
  output: z.string().describe("JSON string of the function tool call"),
  status: z.enum(["in_progress", "completed", "incomplete"]),
});

const CreateResponseRequestBodySchema = z.object({
  model: z.string(),
  instructions: z
    .string()
    .min(MIN_INSTRUCTIONS_LENGTH, CREATE_RESPONSE_ERR_MSG.INSTRUCTIONS_LENGTH)
    .max(MAX_INSTRUCTIONS_LENGTH, CREATE_RESPONSE_ERR_MSG.INSTRUCTIONS_LENGTH)
    .optional(),
  input: z.union([
    z
      .string()
      .min(MIN_INPUT_LENGTH, CREATE_RESPONSE_ERR_MSG.INPUT_LENGTH)
      .max(MAX_INPUT_LENGTH, CREATE_RESPONSE_ERR_MSG.INPUT_LENGTH),
    z
      .array(
        z.union([
          InputMessageSchema,
          FunctionCallSchema,
          FunctionCallOutputSchema,
        ])
      )
      .nonempty(CREATE_RESPONSE_ERR_MSG.INPUT_ARRAY)
      .max(MAX_INPUT_ARRAY_LENGTH, CREATE_RESPONSE_ERR_MSG.INPUT_ARRAY_LENGTH)
      .refine(
        (input) => JSON.stringify(input).length <= MAX_INPUT_LENGTH,
        CREATE_RESPONSE_ERR_MSG.INPUT_LENGTH
      ),
  ]),
  max_output_tokens: z.number().min(0).default(1000),
  metadata: z
    .record(z.string(), z.string().max(512))
    .optional()
    .refine(
      (metadata) => Object.keys(metadata ?? {}).length <= 16,
      CREATE_RESPONSE_ERR_MSG.METADATA_LENGTH
    )
    .refine(
      (metadata) => !metadata || !("conversation_id" in metadata),
      CREATE_RESPONSE_ERR_MSG.METADATA_CONVERSATION_ID_NOT_ALLOWED
    ),
  previous_response_id: z
    .string()
    .optional()
    .describe("The unique ID of the previous response to the model."),
  store: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to store the response in the conversation."),
  stream: z
    .boolean()
    .refine((stream) => stream, CREATE_RESPONSE_ERR_MSG.STREAM),
  temperature: z
    .number()
    .min(0, CREATE_RESPONSE_ERR_MSG.TEMPERATURE)
    .max(0, CREATE_RESPONSE_ERR_MSG.TEMPERATURE)
    .optional()
    .default(0)
    .describe("Temperature for the model. Defaults to 0."),
  tool_choice: z
    .union([
      z.literal("auto"),
      z
        .object({
          type: z.literal("function"),
          name: z.string(),
        })
        .describe("Function tool choice"),
    ])
    .optional()
    .default("auto")
    .describe("Tool choice for the model. Defaults to 'auto'."),
  tools: z
    .array(
      z.object({
        type: z.literal("function"),
        strict: z.boolean(),
        name: z.string(),
        description: z.string().optional(),
        parameters: z
          .record(z.string(), z.unknown())
          .describe(
            "A JSON schema object describing the parameters of the function."
          ),
      })
    )
    .max(MAX_TOOLS, CREATE_RESPONSE_ERR_MSG.TOOLS_LENGTH)
    .refine(
      (tools) => JSON.stringify(tools).length <= MAX_TOOLS_CONTENT_LENGTH,
      CREATE_RESPONSE_ERR_MSG.TOOLS_CONTENT_LENGTH
    )
    .optional()
    .describe("Tools for the model to use."),

  user: z.string().optional().describe("The user ID of the user."),
});

const CreateResponseRequestSchema = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    body: CreateResponseRequestBodySchema,
  })
);

export type CreateResponseRequest = z.infer<typeof CreateResponseRequestSchema>;

export interface CreateResponseRouteParams {
  conversations: ConversationsService;
  generateResponse: GenerateResponse;
  supportedModels: string[];
  maxOutputTokens: number;
  maxUserMessagesInConversation: number;
  /** These metadata keys will persist in conversations and messages even if `Conversation.store: false`.
   * Otherwise, keys will have their values set to an empty string `""` if `Conversation.store: false`. */
  alwaysAllowedMetadataKeys: string[];
  updateTrace?: UpdateTraceFunc;
}

export function makeCreateResponseRoute({
  conversations,
  generateResponse,
  supportedModels,
  maxOutputTokens,
  maxUserMessagesInConversation,
  alwaysAllowedMetadataKeys,
  updateTrace,
}: CreateResponseRouteParams) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    const reqId = getRequestId(req);
    const headers = req.headers as Record<string, string>;
    const dataStreamer = makeDataStreamer();

    try {
      dataStreamer.connect(res);

      // --- INPUT VALIDATION ---
      const { error, data } = CreateResponseRequestSchema.safeParse(req);
      if (error) {
        throw makeBadRequestError({
          error: new Error(generateZodErrorMessage(error)),
          headers,
        });
      }

      const {
        body: {
          model,
          max_output_tokens,
          previous_response_id,
          store,
          metadata,
          user,
          input,
          stream,
          instructions,
          tools,
          tool_choice,
        },
      } = data;

      // --- MODEL CHECK ---
      if (!supportedModels.includes(model)) {
        throw makeBadRequestError({
          error: new Error(CREATE_RESPONSE_ERR_MSG.MODEL_NOT_SUPPORTED(model)),
          headers,
        });
      }

      // --- MAX OUTPUT TOKENS CHECK ---
      if (max_output_tokens > maxOutputTokens) {
        throw makeBadRequestError({
          error: new Error(
            CREATE_RESPONSE_ERR_MSG.MAX_OUTPUT_TOKENS(
              max_output_tokens,
              maxOutputTokens
            )
          ),
          headers,
        });
      }

      // --- STORE CHECK ---
      if (previous_response_id && !store) {
        throw makeBadRequestError({
          error: new Error(CREATE_RESPONSE_ERR_MSG.STORE_NOT_SUPPORTED),
          headers,
        });
      }

      // --- LOAD CONVERSATION ---
      const conversation = await loadConversationByMessageId({
        messageId: previous_response_id,
        conversations,
        headers,
        metadata,
        userId: user,
        storeMessageContent: store,
        alwaysAllowedMetadataKeys,
      });

      // When input is a list length>1, we need to temporarily add the
      // input messages to the conversation, since they're not stored yet.
      if (typeof input !== "string" && input?.length > 1) {
        const tempMessages = convertInputToDBMessages(
          input,
          store,
          alwaysAllowedMetadataKeys,
          metadata
        ).map(
          (msg) =>
            ({
              ...msg,
              id: new ObjectId(),
              createdAt: new Date(),
            } satisfies Message)
        );
        // Exclude the last user message. It'll be used later as latestMessageText.
        const lastUserMessageIndex: number =
          tempMessages.findLastIndex(isUserMessage);
        const conversationMessages: Message[] = tempMessages.filter(
          (_, index) => index !== lastUserMessageIndex
        );
        conversation.messages.push(...conversationMessages);
      }

      // --- CONVERSATION USER ID CHECK ---
      if (hasConversationUserIdChanged(conversation, user)) {
        throw makeBadRequestError({
          error: new Error(
            CREATE_RESPONSE_ERR_MSG.CONVERSATION_USER_ID_CHANGED
          ),
          headers,
        });
      }

      // --- MAX CONVERSATION LENGTH CHECK ---
      if (
        hasTooManyUserMessagesInConversation(
          conversation,
          maxUserMessagesInConversation
        )
      ) {
        throw makeBadRequestError({
          error: new Error(
            CREATE_RESPONSE_ERR_MSG.TOO_MANY_MESSAGES(
              maxUserMessagesInConversation
            )
          ),
          headers,
        });
      }

      // generate responseId to use in conversation DB AND Responses API stream
      const responseId = new ObjectId();
      const baseResponse = makeBaseResponseData({
        responseId,
        data: data.body,
        conversationId: conversation._id,
      });

      dataStreamer.streamResponses({
        type: "response.created",
        response: {
          ...baseResponse,
          created_at: Date.now(),
        },
      } satisfies ResponseStreamCreated);

      dataStreamer.streamResponses({
        type: "response.in_progress",
        response: {
          ...baseResponse,
          created_at: Date.now(),
        },
      } satisfies ResponseStreamInProgress);

      const latestMessageText = convertInputToLatestMessageText(input, headers);

      const traceMetadata = {
        name: "generateResponse",
        event: {
          id: responseId.toHexString(),
          metadata: {
            conversationId: conversation._id.toHexString(),
            store,
          },
        },
      };

      // Create a wrapper trace. This always creates a top-level trace.
      // It only traces the contents of the generateResponse function
      // if `store` is true.
      const generateResponseMaybeTraced = store
        ? wrapTraced(generateResponse, traceMetadata)
        : traced(() => wrapNoTrace(generateResponse), traceMetadata);

      const { messages } = await generateResponseMaybeTraced({
        shouldStream: stream,
        latestMessageText,
        customSystemPrompt: instructions,
        toolDefinitions: tools,
        toolChoice: tool_choice,
        conversation: makeTraceConversation(conversation),
        dataStreamer,
        reqId,
      });

      // --- STORE NEW MESSAGES IN CONVERSATION ---
      await saveMessagesToConversation({
        conversations,
        conversation,
        store,
        metadata,
        input,
        messages,
        responseId,
        alwaysAllowedMetadataKeys,
      });

      dataStreamer.streamResponses({
        type: "response.completed",
        response: {
          ...baseResponse,
          created_at: Date.now(),
          // pass actual token usage: https://jira.mongodb.org/browse/EAI-1215
          usage: {
            input_tokens: 0,
            input_tokens_details: { cached_tokens: 0 },
            output_tokens: 0,
            output_tokens_details: { reasoning_tokens: 0 },
            total_tokens: 0,
          },
        },
      } satisfies ResponseStreamCompleted);
      await updateTraceIfExists({
        updateTrace,
        reqId,
        conversations,
        conversationId: conversation._id,
        assistantResponseMessageId: responseId,
      });
    } catch (error) {
      const standardError =
        (error as SomeOpenAIAPIError)?.type === ERROR_TYPE
          ? (error as SomeOpenAIAPIError)
          : makeInternalServerError({ error: error as Error, headers });

      if (dataStreamer.connected) {
        dataStreamer.streamResponses({
          ...standardError,
          type: ERROR_TYPE,
          code: standardError.code ?? null,
          param: standardError.param ?? null,
        } satisfies ResponseStreamError);
      } else {
        sendErrorResponse({
          res,
          reqId,
          error: standardError,
        });
      }
    } finally {
      if (dataStreamer.connected) {
        dataStreamer.disconnect();
      }
    }
  };
}

interface LoadConversationByMessageIdParams {
  messageId?: string;
  conversations: ConversationsService;
  headers: Record<string, string>;
  metadata?: Record<string, string>;
  userId?: string;
  storeMessageContent: boolean;
  alwaysAllowedMetadataKeys: string[];
}

export const creationInterface = "responses-api";

const loadConversationByMessageId = async ({
  messageId,
  conversations,
  headers,
  metadata,
  userId,
  storeMessageContent,
  alwaysAllowedMetadataKeys,
}: LoadConversationByMessageIdParams): Promise<Conversation> => {
  if (!messageId) {
    const formattedMetadata = formatMetadata({
      shouldStore: storeMessageContent,
      alwaysAllowedMetadataKeys,
      metadata,
    });

    return await conversations.create({
      userId,
      customData: { metadata: formattedMetadata },
      creationInterface,
    });
  }

  const conversation = await conversations.findByMessageId({
    messageId: convertToObjectId(messageId, headers),
  });

  if (!conversation) {
    throw makeBadRequestError({
      error: new Error(CREATE_RESPONSE_ERR_MSG.MESSAGE_NOT_FOUND(messageId)),
      headers,
    });
  }

  // The default should be true because, if unset, we assume message data is stored
  const shouldStoreConversation = conversation.storeMessageContent ?? true;
  // this ensures that conversations will respect the store flag initially set
  if (shouldStoreConversation !== storeMessageContent) {
    throw makeBadRequestError({
      error: new Error(CREATE_RESPONSE_ERR_MSG.CONVERSATION_STORE_MISMATCH),
      headers,
    });
  }

  const latestMessage = conversation.messages[conversation.messages.length - 1];
  if (latestMessage.id.toString() !== messageId) {
    throw makeBadRequestError({
      error: new Error(CREATE_RESPONSE_ERR_MSG.MESSAGE_NOT_LATEST(messageId)),
      headers,
    });
  }

  return conversation;
};

const convertToObjectId = (
  inputString: string,
  headers: Record<string, string>
): ObjectId => {
  try {
    return new ObjectId(inputString);
  } catch (error) {
    throw makeBadRequestError({
      error: new Error(CREATE_RESPONSE_ERR_MSG.INVALID_OBJECT_ID(inputString)),
      headers,
    });
  }
};

// ideally this doesn't need to be exported once nothing else relies on it (addMessageToConversation for now)
export const hasTooManyUserMessagesInConversation = (
  conversation: Conversation,
  maxUserMessagesInConversation: number
): boolean => {
  const numUserMessages = conversation.messages.reduce(
    (acc, message) => (message.role === "user" ? acc + 1 : acc),
    0
  );
  return numUserMessages >= maxUserMessagesInConversation;
};

const hasConversationUserIdChanged = (
  conversation: Conversation,
  userId?: string
): boolean => {
  return conversation.userId !== userId;
};

type MessagesParam = Parameters<
  ConversationsService["addManyConversationMessages"]
>[0]["messages"];

interface AddMessagesToConversationParams {
  conversations: ConversationsService;
  conversation: Conversation;
  store: boolean;
  metadata?: Record<string, string>;
  input: CreateResponseRequest["body"]["input"];
  messages: MessagesParam;
  responseId: ObjectId;
  alwaysAllowedMetadataKeys: string[];
}

const saveMessagesToConversation = async ({
  conversations,
  conversation,
  store,
  metadata,
  input,
  messages,
  responseId,
  alwaysAllowedMetadataKeys,
}: AddMessagesToConversationParams) => {
  const messagesToAdd = [
    ...convertInputToDBMessages(
      input,
      store,
      alwaysAllowedMetadataKeys,
      metadata
    ),
    ...messages.map((message) =>
      formatMessage(message, store, alwaysAllowedMetadataKeys, metadata)
    ),
  ];
  // handle setting the response id for the last message
  // this corresponds to the response id in the response stream
  if (messagesToAdd.length > 0) {
    messagesToAdd[messagesToAdd.length - 1].id = responseId;
  }

  return await conversations.addManyConversationMessages({
    conversationId: conversation._id,
    messages: messagesToAdd,
  });
};

const convertInputToDBMessages = (
  input: CreateResponseRequest["body"]["input"],
  store: boolean,
  alwaysAllowedMetadataKeys: string[],
  metadata?: Record<string, string>
): MessagesParam => {
  if (typeof input === "string") {
    return [
      formatMessage(
        { role: "user", content: input },
        store,
        alwaysAllowedMetadataKeys,
        metadata
      ),
    ];
  }

  return input.map((message) => {
    if (isInputMessage(message)) {
      const role = message.role;
      const content = formatUserMessageContent(message.content);
      return formatMessage(
        { role, content },
        store,
        alwaysAllowedMetadataKeys,
        metadata
      );
    }
    // handle function tool calls and outputs
    const role = "tool";
    const name = message.type === "function_call" ? message.name : message.type;
    const content =
      message.type === "function_call" ? message.arguments : message.output;
    return formatMessage(
      { role, name, content },
      store,
      alwaysAllowedMetadataKeys,
      metadata
    );
  });
};

const formatMessage = (
  message: MessagesParam[number],
  store: boolean,
  alwaysAllowedMetadataKeys: string[],
  metadata?: Record<string, string>
): MessagesParam[number] => {
  // store a placeholder string if we're not storing message data
  const formattedContent = store ? message.content : "";
  // handle cleaning metadata fields if we're not storing message data
  const formattedMetadata = formatMetadata({
    shouldStore: store,
    alwaysAllowedMetadataKeys,
    metadata,
  });
  const formattedCustomData = formatMetadata({
    shouldStore: store,
    alwaysAllowedMetadataKeys,
    metadata: message.customData,
  });

  return {
    ...message,
    content: formattedContent,
    metadata: formattedMetadata,
    customData: formattedCustomData,
  };
};

interface FormatMetadataParams {
  shouldStore: boolean;
  alwaysAllowedMetadataKeys: string[];
  metadata?: Record<string, unknown>;
}

const formatMetadata = ({
  shouldStore,
  alwaysAllowedMetadataKeys,
  metadata,
}: FormatMetadataParams) => {
  if (shouldStore || !metadata) return metadata;

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      alwaysAllowedMetadataKeys.includes(key) ? value : "",
    ])
  );
};

interface BaseResponseData {
  responseId: ObjectId;
  conversationId: ObjectId;
  data: CreateResponseRequest["body"];
}

const makeBaseResponseData = ({
  responseId,
  conversationId,
  data,
}: BaseResponseData) => {
  const baseMetadata = {
    conversation_id: conversationId.toString(),
  };
  return {
    id: responseId.toString(),
    object: "response" as const,
    error: null,
    incomplete_details: null,
    instructions: data.instructions ?? null,
    max_output_tokens: data.max_output_tokens ?? null,
    model: data.model,
    output_text: "",
    output: [],
    parallel_tool_calls: true,
    previous_response_id: data.previous_response_id ?? null,
    store: data.store,
    temperature: data.temperature,
    stream: data.stream,
    tool_choice: data.tool_choice,
    tools: data.tools ?? [],
    top_p: null,
    user: data.user,
    metadata: data.metadata
      ? { ...baseMetadata, ...data.metadata }
      : baseMetadata,
  };
};

const convertInputToLatestMessageText = (
  input: CreateResponseRequest["body"]["input"],
  headers: Record<string, string>
): string => {
  if (typeof input === "string") {
    return input;
  }

  const lastUserMessage = input.findLast(isUserMessage);
  if (!lastUserMessage) {
    throw makeBadRequestError({
      error: new Error("No user message found in input"),
      headers,
    });
  }

  return formatUserMessageContent(lastUserMessage.content);
};

const isInputMessage = (message: unknown): message is InputMessage =>
  InputMessageSchema.safeParse(message).success;

const isUserMessage = (message: unknown): message is UserMessage =>
  UserMessageSchema.safeParse(message).success;

const formatUserMessageContent = (content: InputMessage["content"]): string => {
  if (typeof content === "string") return content;
  return content[0].text;
};
