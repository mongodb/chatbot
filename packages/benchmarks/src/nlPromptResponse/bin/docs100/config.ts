import { getModelsFromLabels } from "../../../benchmarkModels";
import { OpenAI } from "mongodb-rag-core/openai";

export const DATASET_NAME = "docs-100-prompt-completion";

export const PROJECT_NAME = "docs-100-prompt-completion";

export const EXPERIMENT_BASE_NAME = "docs-100";

export const initialMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful MongoDB assistant. Answer the user's question directly, informatively, and concisely.",
  },
];

export * from "../globalConfig";
