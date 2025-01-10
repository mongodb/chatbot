import { type References } from "./references";
import {
  AssistantMessageData,
  AssistantMessageMetadata,
  Role,
  UserMessageData,
} from "./services/conversations";

export function createMessageId() {
  const now = Date.now();
  const nonce = Math.floor(Math.random() * 100000);
  return String(now + nonce);
}

export type CreateSomeMessageArgs = {
  role: Role;
  content: string;
};

export type CreateUserMessageArgs = CreateSomeMessageArgs & {
  role: "user";
};

export type CreateAssistantMessageArgs = CreateSomeMessageArgs & {
  role: "assistant";
  references?: References;
  metadata?: AssistantMessageMetadata;
};

export type CreateMessageArgs =
  | CreateUserMessageArgs
  | CreateAssistantMessageArgs;

export function createUserMessage(
  args: CreateUserMessageArgs
): UserMessageData {
  return {
    id: createMessageId(),
    createdAt: new Date().toISOString(),
    ...args,
  };
}

export function createAssistantMessage(
  args: CreateAssistantMessageArgs
): AssistantMessageData {
  return {
    id: createMessageId(),
    createdAt: new Date().toISOString(),
    ...args,
  };
}

export default function createMessage(
  args: CreateMessageArgs
): UserMessageData | AssistantMessageData {
  switch (args.role) {
    case "user":
      return createUserMessage(args);
    case "assistant":
      return createAssistantMessage(args);
  }
}
