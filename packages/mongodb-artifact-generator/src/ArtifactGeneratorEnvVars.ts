import { CORE_ENV_VARS } from "mongodb-rag-core";

export const GENERATOR_LLM_ENV_VARS = {
  GENERATOR_LLM_MAX_CONCURRENCY: "",
};

export const ArtifactGeneratorEnvVars = {
  ...CORE_ENV_VARS,
  ...GENERATOR_LLM_ENV_VARS,
};
