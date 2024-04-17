import { CORE_ENV_VARS } from "mongodb-rag-core";

export const ArtifactGeneratorEnvVars = {
  ...CORE_ENV_VARS,
  GITHUB_ACCESS_TOKEN: "",
  JIRA_USERNAME: "",
  JIRA_PASSWORD: "",
};
