import { isIP } from "net";
import { Address6 } from "ip-address";
import { Conversation, Message, References } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { z } from "zod";

export type ApiMessage = z.infer<typeof ApiMessage>;
export const ApiMessage = z.object({
  id: z.string(),
  role: z.enum(["system", "assistant", "user", "function"]),
  content: z.string(),
  rating: z.boolean().optional(),
  createdAt: z.number(),
  references: References.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ApiConversation = z.infer<typeof ApiConversation>;
export const ApiConversation = z.object({
  _id: z.string(),
  messages: z.array(ApiMessage),
  createdAt: z.number(),
});

export function convertMessageFromDbToApi(
  message: Message,
  conversationId?: ObjectId
): ApiMessage {
  const { id, createdAt, role, content } = message;
  const apiMessage = {
    id: id.toString(),
    role,
    content,
    createdAt: createdAt.getTime(),
  };
  if (role === "assistant") {
    const { rating, references, metadata = {} } = message;
    if (conversationId) {
      metadata.conversationId = conversationId?.toString();
    }
    const augmentedApiMessage: ApiMessage = {
      ...apiMessage,
      rating,
      references,
    };
    if (Object.keys(metadata).length > 0) {
      augmentedApiMessage.metadata = metadata;
    }
    return augmentedApiMessage;
  }
  return apiMessage;
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
