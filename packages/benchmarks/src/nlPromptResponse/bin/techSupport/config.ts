import { OpenAI } from "mongodb-rag-core/openai";

export const DATASET_NAME = "tech-support-q-and-a-verified-tagged";

export const PROJECT_NAME = "tech-support-prompt-completion";

export const EXPERIMENT_BASE_NAME = "tech-support";

export const initialMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful MongoDB technical services representative. Answer the user's question directly, informatively, and concisely.",
  },
];

export * from "../globalConfig";
