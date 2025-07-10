import { OpenAI } from "openai";

export type LlmOptions = Omit<
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  "messages" | "tools" | "tool_choice"
>;
