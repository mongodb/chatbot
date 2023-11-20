export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export function chatMessage<T extends ChatMessage>(t: T) {
  return t;
}

export const systemMessage = (content: string) =>
  chatMessage({ role: "system", content });
export const userMessage = (content: string) => chatMessage({ role: "user", content });
export const assistantMessage = (content: string) =>
  chatMessage({ role: "assistant", content });
