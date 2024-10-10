export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export function chatMessage<T extends ChatMessage>(t: T) {
  return t;
}

export const systemMessage = (content: string) =>
  chatMessage({ role: "system", content });

export const userMessage = (content: string | object) =>
  chatMessage({ role: "user", content: JSON.stringify(content) });

export const assistantMessage = (content: string | object) =>
  chatMessage({ role: "assistant", content: JSON.stringify(content) });

export * from "./makeGenerateChatCompletion";
