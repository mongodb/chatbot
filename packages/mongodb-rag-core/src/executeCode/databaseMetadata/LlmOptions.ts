import { OpenAI } from "openai";

export type LlmOptions = {
  openAiClient: OpenAI;
} & Omit<
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  "messages" | "tools" | "tool_choice"
>;
