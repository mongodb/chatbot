import type { ConfigInput } from "../config";
import { createConsoleAndFileLogger } from "../logger";
import {
  makeAzureOpenAiClient,
  makeGenerateChatCompletion,
} from "../llm/openai-api";
import { makeSummarizeReleaseArtifact } from "../llm/summarizeReleaseArtifact";
import { makeCreateChangelogEntry } from "../llm/createChangelogEntry";
import { makeClassifyChangelog } from "../llm/classifyChangelog";
import { changelogClassificationSchema } from "../change";

export type MakeStandardConfigMethodsArgs = {
  azureOpenAi: {
    apiKey: string;
    endpoint: string;
    apiVersion: string;
    chatCompletionDeployment: string;
  };
  logger?: {
    namespace: string;
    outputDir: string;
  };
};

export function makeStandardConfigMethods(
  args: MakeStandardConfigMethodsArgs,
): Pick<
  ConfigInput,
  | "logger"
  | "summarizeArtifact"
  | "extractChanges"
  | "classifyChange"
  | "filterChange"
> {
  const logger = args.logger
    ? createConsoleAndFileLogger(args.logger)
    : undefined;
  const openAiClient = makeAzureOpenAiClient(args.azureOpenAi);
  const generateChatCompletion = makeGenerateChatCompletion({
    openAiClient,
    model: args.azureOpenAi.chatCompletionDeployment,
  });
  const summarizeReleaseArtifact = makeSummarizeReleaseArtifact({
    generate: generateChatCompletion,
  });
  const createChangelogEntry = makeCreateChangelogEntry({
    generate: generateChatCompletion,
  });
  const classifyChangelog = makeClassifyChangelog({
    openAiClient,
    model: args.azureOpenAi.chatCompletionDeployment,
  });
  return {
    logger,
    summarizeArtifact: async ({ project, artifact }) => {
      return summarizeReleaseArtifact({
        artifact,
        projectDescription: project.description,
      });
    },
    extractChanges: async ({ project, artifact }) => {
      const changes = await createChangelogEntry({
        artifact,
        projectDescription: project.description,
      });
      return changes.map((change) => ({
        description: change,
        sourceIdentifier: artifact.id,
      }));
    },
    classifyChange: async (change) => {
      const classifiedChangelog = await classifyChangelog({
        changelog: change.description,
      });
      return changelogClassificationSchema.parse({
        audience: classifiedChangelog.audience.type,
        scope: classifiedChangelog.scope.type,
      });
    },
    filterChange: (change) => {
      return change.classification.audience === "external";
    },
  };
}
