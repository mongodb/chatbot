import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { makeRunLogger, type RunLogger } from "../runlogger";
import { getReleaseArtifacts } from "../release-notes/getReleaseArtifacts";
import { summarizeReleaseArtifacts } from "../release-notes/summarizeReleaseArtifacts";
import {
  ReleaseArtifact,
  releaseArtifactShortMetadata,
} from "../release-notes/projects";
import { promises as fs } from "fs";
import YAML from "yaml";
import { ReleaseInfo } from "../release-notes/ReleaseInfo";
import { createChangelogs } from "../release-notes/createChangelog";
import { groupBy } from "../utils";
import {
  ClassifiedChangelog,
  makeClassifyChangelogs,
} from "../release-notes/classifyChangelog";
import { assertEnvVars } from "mongodb-rag-core";

let logger: RunLogger;

type GenerateReleaseNotesCommandArgs = {
  runId?: string;
  releaseInfo: string;
  llmMaxConcurrency: number;
};

const { OPENAI_CHAT_COMPLETION_DEPLOYMENT } = assertEnvVars({
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
});
export default createCommand<GenerateReleaseNotesCommandArgs>({
  command: "generateReleaseNotes",
  builder(args) {
    return withConfigOptions(args)
      .option("runId", {
        type: "string",
        demandOption: false,
        description:
          "A unique name for the run. This controls where outputs artifacts and logs are stored.",
      })
      .option("llmMaxConcurrency", {
        type: "number",
        demandOption: false,
        default: 10,
        description:
          "The maximum number of concurrent requests to the LLM API. Defaults to 10.",
      })
      .option("releaseInfo", {
        type: "string",
        demandOption: true,
        description: "A path to a YAML file with release information.",
      });
  },
  async handler(args) {
    logger = makeRunLogger({
      topic: "GenerateReleaseNotes",
      runId: args.runId,
    });
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    try {
      const result = await withConfig(action, args);
      logger.logInfo(`Success`);
      return result;
    } finally {
      await logger.flushArtifacts();
      await logger.flushLogs();
    }
  },
  describe:
    "[WIP] Generate release notes for a project based on a description & release artifacts.",
});

export const action = createConfiguredAction<GenerateReleaseNotesCommandArgs>(
  async (
    { githubApi, jiraApi, openAiClient },
    { releaseInfo: releaseInfoPath, llmMaxConcurrency }
  ) => {
    logger.logInfo(`Setting up...`);

    if (!githubApi) {
      throw new Error(
        "githubApi is required. Make sure to define it in the config."
      );
    }
    if (!jiraApi) {
      throw new Error(
        "jiraApi is required. Make sure to define it in the config."
      );
    }
    if (!openAiClient) {
      throw new Error(
        "openAiClient is required. Make sure to define it in the config."
      );
    }

    if (!(await fs.lstat(releaseInfoPath)).isFile()) {
      throw new Error(`releaseInfoPath must be a file: ${releaseInfoPath}`);
    }
    const releaseInfoText = await fs.readFile(releaseInfoPath, "utf8");
    const releaseInfo = ReleaseInfo.parse(YAML.parse(releaseInfoText));

    console.log("releaseInfo", releaseInfo);
    logger.logInfo(`releaseInfo: ${JSON.stringify(releaseInfo)}`);

    const releaseArtifacts = await getReleaseArtifacts({
      github: releaseInfo.github
        ? {
            githubApi,
            ...releaseInfo.github,
          }
        : undefined,
      jira: releaseInfo.jira
        ? {
            jiraApi,
            ...releaseInfo.jira,
          }
        : undefined,
    });

    logger.appendArtifact(
      "releaseArtifacts.json",
      JSON.stringify(releaseArtifacts)
    );

    const numArtifacts = releaseArtifacts.length;
    const releaseArtifactsByType = groupBy(
      releaseArtifacts,
      ({ type }) => type
    );
    console.log(`fetched ${numArtifacts} artifacts:`);

    Object.entries(releaseArtifactsByType).forEach(([type, artifacts]) => {
      console.log(`  ${type}: ${artifacts.length}`);
    });

    console.log(`summarizing ${numArtifacts} artifacts`);
    const summaries = new Map<ReleaseArtifact, string>();
    await summarizeReleaseArtifacts({
      logger,
      projectDescription: releaseInfo.projectDescription,
      artifacts: releaseArtifacts,
      concurrency: llmMaxConcurrency,
      onArtifactSummarized: (artifact, summary) => {
        summaries.set(artifact, summary);
      },
    });

    console.log(`generated ${summaries.size} summaries`);

    const artifactSummaries = Array.from(summaries.entries()).map(
      ([artifact, summary]) => ({
        artifact: releaseArtifactShortMetadata(artifact),
        summary,
      })
    );

    logger.appendArtifact(
      "releaseArtifactSummaries.json",
      JSON.stringify(artifactSummaries)
    );

    console.log(
      `creating changelogs for ${artifactSummaries.length} summaries`
    );

    const changelogs = await createChangelogs({
      logger,
      projectDescription: releaseInfo.projectDescription,
      artifactSummaries,
      concurrency: llmMaxConcurrency,
    });

    logger.appendArtifact("changelogs.json", JSON.stringify(changelogs));

    const classifyChangelogs = makeClassifyChangelogs({
      openAiClient,
      model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      logger,
    });

    const classifiedChangelogs = await classifyChangelogs({
      changelogs,
      concurrency: llmMaxConcurrency,
    });

    logger.appendArtifact(
      "classifiedChangelogs.json",
      JSON.stringify(classifiedChangelogs)
    );

    function createPrintableChangelog(c: ClassifiedChangelog) {
      return `[${c.audience.type} ${c.scope.type}]: ${c.changelog}`;
    }

    const externalClassifiedChangelogs = classifiedChangelogs.filter(
      (c) => c.audience.type !== "internal"
    );

    logger.appendArtifact(
      "classifiedChangelogs.external.json",
      JSON.stringify(externalClassifiedChangelogs)
    );

    const formattedExternalChangelogs = externalClassifiedChangelogs.map(
      createPrintableChangelog
    );

    logger.appendArtifact(
      "formattedExternalChangelogs.json",
      JSON.stringify(formattedExternalChangelogs)
    );
  }
);
