import { LlmOptions } from "mongodb-rag-core/executeCode";
import { OpenAI } from "mongodb-rag-core/openai";

export const DATASET_NAME = "tech-support-q-and-a-verified";

export const PROJECT_NAME = "tech-support-prompt-completion";

export const MAX_CONCURRENT_EXPERIMENTS = 5;

export const llmAsAJudgeOptions: LlmOptions = {
  model: "gpt-4o",
  // TODO: pass relevant vars from env to openai client
  openAiClient: new OpenAI(),
};

export { MODELS, makeLlmOptions } from "../../openAiClients";
