import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { makeRunLogger, type RunLogger } from "../runlogger";
import { getReleaseArtifacts } from "../release-notes/getReleaseArtifacts";
import { summarizeReleaseArtifact } from "../release-notes/summarizeReleaseArtifact";
import {
  ReleaseArtifact,
  releaseArtifactShortMetadata,
} from "../release-notes/projects";
import { promises as fs } from "fs";
import YAML from "yaml";
import { ReleaseInfo } from "../release-notes/ReleaseInfo";

let logger: RunLogger;

type GenerateReleaseNotesCommandArgs = {
  runId?: string;
  releaseInfo: string;
};

export default createCommand<GenerateReleaseNotesCommandArgs>({
  command: "generateReleaseNotes",
  builder(args) {
    return withConfigOptions(args)
      .option("runId", {
        type: "string",
        demandOption: false,
        description: "A (hopefully unique) name for the run.",
      })
      .option("releaseInfo", {
        type: "string",
        demandOption: true,
        description:
          "A path to a YAML file with release information. This file should contain the following keys: `github`, `jira`.",
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
  describe: "TODO",
});

export const action = createConfiguredAction<GenerateReleaseNotesCommandArgs>(
  async (
    //
    { githubApi, jiraApi },
    { releaseInfo: releaseInfoPath }
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

    if (!(await fs.lstat(releaseInfoPath)).isFile()) {
      throw new Error(`releaseInfoPath must be a file: ${releaseInfoPath}`);
    }
    const releaseInfoText = await fs.readFile(releaseInfoPath, "utf8");
    const releaseInfo = ReleaseInfo.parse(YAML.parse(releaseInfoText));

    const releaseArtifacts = await getReleaseArtifacts({
      github: {
        githubApi,
        ...releaseInfo.github,
      },
      jira: {
        jiraApi,
        ...releaseInfo.jira,
      },
    });

    logger.appendArtifact(
      "releaseArtifacts.json",
      JSON.stringify(releaseArtifacts)
    );

    const numArtifacts = releaseArtifacts.length;
    const summaries = new Map<ReleaseArtifact, string>();

    console.log(`summarizing ${numArtifacts} artifacts`);

    for (const [i, artifact] of Object.entries(releaseArtifacts)) {
      const iOfN = `(${Number(i) + 1}/${numArtifacts})`;
      logger.logInfo(`summarizing ${artifact.type} ${iOfN}`);
      console.log(`summarizing ${artifact.type} ${iOfN}`);
      try {
        const summary = await summarizeReleaseArtifact({
          projectDescription: releaseInfo.projectDescription,
          artifact,
          logger,
        });
        logger.logInfo(`generated summary for ${artifact.type} ${iOfN}`);
        console.log(`generated summary for ${artifact.type} ${iOfN}`);
        summaries.set(artifact, summary);
      } catch (e) {
        console.log(`error summarizing ${artifact.type} ${iOfN}\n${e}`);
        logger.logError(`error summarizing ${artifact.type} ${iOfN}\n${e}`);
      }
    }

    console.log(`generated ${summaries.size} summaries`);

    const summaryFile = JSON.stringify(
      Array.from(summaries.entries()).map(([artifact, summary]) => [
        releaseArtifactShortMetadata(artifact),
        summary,
      ])
    );

    logger.appendArtifact("releaseArtifactSummaries.json", summaryFile);
  }
);
