import { OpenAI } from "mongodb-rag-core/openai";

export const DATASET_NAME = "product-knowledge-prompt-completion";

export const PROJECT_NAME = "product-knowledge-prompt-completion";

export const EXPERIMENT_BASE_NAME = "product-knowledge";

export const initialMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful MongoDB assistant. Answer the user's question directly, informatively, and concisely.",
  },
];

export * from "../globalConfig";
