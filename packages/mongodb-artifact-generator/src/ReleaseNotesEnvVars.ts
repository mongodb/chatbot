import { ArtifactGeneratorEnvVars } from "./ArtifactGeneratorEnvVars";

export const ReleaseNotesEnvVars = {
  ...ArtifactGeneratorEnvVars,
  GITHUB_ACCESS_TOKEN: "",
  JIRA_USERNAME: "",
  JIRA_PASSWORD: "",
};
