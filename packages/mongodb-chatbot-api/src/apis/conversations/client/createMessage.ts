import { AssistantMessage, Message, UserMessage } from "../types";

export function createMessageId() {
  const now = Date.now();
  const nonce = Math.floor(Math.random() * 100000);
  return String(now + nonce);
}

type CreateSomeMessageInit<M extends Message = Message> = Pick<M, "role" | "content"> &
  Partial<Omit<M, "role" | "content">>;

export type CreateUserMessageInit = CreateSomeMessageInit<UserMessage>;

export type CreateAssistantMessageInit = CreateSomeMessageInit<AssistantMessage>;

export type CreateMessageInit = CreateUserMessageInit | CreateAssistantMessageInit;

export function createMessage(init: CreateUserMessageInit): UserMessage;
export function createMessage(init: CreateAssistantMessageInit): AssistantMessage;
export function createMessage(
  init: CreateSomeMessageInit
): UserMessage | AssistantMessage;
export function createMessage(init: CreateMessageInit): Message {
  const { id, content, createdAt, role } = init;
  const baseMessage = {
    id: id ?? createMessageId(),
    content,
    createdAt: createdAt ?? new Date().toISOString(),
  };
  switch (role) {
    case "user": {
      return UserMessage.parse({
        role,
        ...baseMessage,
      });
    }
    case "assistant":
      return AssistantMessage.parse({
        role,
        ...baseMessage,
        metadata: init.metadata,
        rating: init.rating,
        references: init.references ?? [],
        suggestedPrompts: init.suggestedPrompts,
      });
  }
}
