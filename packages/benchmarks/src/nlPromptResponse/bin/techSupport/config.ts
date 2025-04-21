import { getModelsFromLabels } from "../../../benchmarkModels";
import { OpenAI } from "mongodb-rag-core/openai";

export const DATASET_NAME = "tech-support-q-and-a-verified-tagged";

export const PROJECT_NAME = "tech-support-prompt-completion";

export const EXPERIMENT_BASE_NAME = "tech-support";

export const EXPERIMENT_TYPE = "prompt-response";

export const MAX_CONCURRENT_EXPERIMENTS = 2;

// Have to set low to allow for judge token limits :(
export const MAX_CONCURRENCY = 5;

export const initialMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful MongoDB technical services representative. Answer the user's question directly, informatively, and concisely.",
  },
];

export const judgeModelsConfig = getModelsFromLabels([
  "gpt-4.1",
  "claude-37-sonnet",
  "claude-35-sonnet-v2",
  "claude-35-sonnet",
  "gpt-4o",
  "gpt-4o-mini",
  "llama-3.1-70b",
  "llama-3.2-90b",
  "llama-3.3-70b",
]);

export const models = getModelsFromLabels(["gpt-4.1", "claude-37-sonnet"]);
