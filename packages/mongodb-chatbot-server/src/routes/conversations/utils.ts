import { isIP } from "net";
import { Address6 } from "ip-address";
import {
  AssistantMessage,
  Conversation,
  Message,
  ReferencesSchema,
} from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { z } from "zod";

export const BaseApiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "assistant", "user", "function"]),
  content: z.string(),
  createdAt: z.number(),
});
export type BaseApiMessage = z.infer<typeof BaseApiMessageSchema>;
export function convertBaseMessageFromDbToApi({
  message,
}: {
  message: Message;
}): BaseApiMessage {
  const { id, createdAt, role, content } = message;
  return BaseApiMessageSchema.parse({
    id: id.toString(),
    role,
    content,
    createdAt: createdAt.getTime(),
  });
}

export const SystemApiMessageSchema = BaseApiMessageSchema.extend({
  role: z.literal("system"),
});
export type SystemApiMessage = z.infer<typeof SystemApiMessageSchema>;
export function convertSystemMessageFromDbToApi({
  message,
}: {
  message: Message;
}): SystemApiMessage {
  return SystemApiMessageSchema.parse(
    convertBaseMessageFromDbToApi({ message })
  );
}

export const UserApiMessageSchema = BaseApiMessageSchema.extend({
  role: z.literal("user"),
});
export type UserApiMessage = z.infer<typeof UserApiMessageSchema>;
export function convertUserMessageFromDbToApi({
  message,
}: {
  message: Message;
}): UserApiMessage {
  return UserApiMessageSchema.parse(convertBaseMessageFromDbToApi({ message }));
}

export const AssistantApiMessageSchema = BaseApiMessageSchema.extend({
  conversationId: z.string().optional(),
  role: z.literal("assistant"),
  rating: z.boolean().optional(),
  references: ReferencesSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type AssistantApiMessage = z.infer<typeof AssistantApiMessageSchema>;
export function convertAssistantMessageFromDbToApi({
  message,
  conversationId,
}: {
  message: Message;
  conversationId?: ObjectId;
}): AssistantApiMessage {
  const baseMessage = convertBaseMessageFromDbToApi({
    message,
  }) as AssistantApiMessage;
  const { rating, references, metadata = {} } = message as AssistantMessage;

  // Conditionally add rating, references, metadata, and conversationId only if they exist
  if (rating !== undefined) {
    baseMessage.rating = rating;
  }
  if (references !== undefined) {
    baseMessage.references = references;
  }
  if (conversationId !== undefined) {
    metadata.conversationId = conversationId.toHexString();
  }
  if (Object.keys(metadata).length > 0) {
    baseMessage.metadata = metadata;
  }

  return AssistantApiMessageSchema.parse(baseMessage);
}

export const FunctionApiMessageSchema = BaseApiMessageSchema.extend({
  role: z.literal("function"),
});
export type FunctionApiMessage = z.infer<typeof FunctionApiMessageSchema>;
export function convertFunctionMessageFromDbToApi({
  message,
}: {
  message: Message;
}): FunctionApiMessage {
  return FunctionApiMessageSchema.parse(
    convertBaseMessageFromDbToApi({ message })
  );
}

export const ApiMessageSchema = z.union([
  SystemApiMessageSchema,
  UserApiMessageSchema,
  AssistantApiMessageSchema,
  FunctionApiMessageSchema,
]);
export type ApiMessage = z.infer<typeof ApiMessageSchema>;

export type ApiConversation = z.infer<typeof ApiConversationSchema>;
export const ApiConversationSchema = z.object({
  _id: z.string(),
  messages: z.array(ApiMessageSchema),
  createdAt: z.number(),
});

export function convertMessageFromDbToApi(
  message: Message,
  conversationId?: ObjectId
) {
  switch (message.role) {
    case "system": {
      return convertSystemMessageFromDbToApi({ message });
    }
    case "user": {
      return convertUserMessageFromDbToApi({ message });
    }
    case "assistant": {
      return convertAssistantMessageFromDbToApi({ message, conversationId });
    }
    case "function": {
      return convertFunctionMessageFromDbToApi({ message });
    }
    default: {
      return convertBaseMessageFromDbToApi({ message });
    }
  }
}

function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function isMessageAllowedInApiResponse(message: Message) {
  // Only return user messages and assistant messages that are not function calls
  switch (message.role) {
    case "system":
      return false;
    case "user":
      return true;
    case "assistant":
      return message.functionCall === undefined;
    case "function":
      return false;
    default:
      // This should never happen - it means we missed a case in the switch.
      // The assertNever function raises a type error if this happens.
      return assertNever(message);
  }
}

export function convertConversationFromDbToApi(
  conversation: Conversation
): ApiConversation {
  return {
    _id: conversation._id.toHexString(),
    createdAt: conversation.createdAt.getTime(),
    messages: conversation.messages
      .filter(isMessageAllowedInApiResponse)
      .map((message) => convertMessageFromDbToApi(message)),
  };
}

export function isValidIp(ip?: string) {
  return ip !== undefined && isIP(ip) > 0;
}

export function areEquivalentIpAddresses(ip1: string, ip2: string) {
  if (Address6.isValid(ip1)) {
    ip1 = new Address6(ip1).to4().correctForm();
  }
  if (Address6.isValid(ip2)) {
    ip2 = new Address6(ip2).to4().correctForm();
  }
  return ip1 === ip2;
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
