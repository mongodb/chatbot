import { strict as assert } from "assert";
import { MODELS } from "../../../benchmarkModels";
import { models } from "mongodb-rag-core/models";
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

const judgeModelLabels = ["gpt-4.1", "claude-37-sonnet"];
const maybeJudgeModelsConfig = models.filter((m) =>
  judgeModelLabels.includes(m.label)
);
assert(
  maybeJudgeModelsConfig.length === judgeModelLabels.length,
  `At least one of ${judgeModelLabels.join(", ")} not found`
);
export const judgeModelsConfig = maybeJudgeModelsConfig;
export { MODELS };
