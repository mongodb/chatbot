import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { makeGenerateChatCompletion } from "../chat";
import { makeRunLogger, type RunLogger } from "../runlogger";

let logger: RunLogger;

type GenerateReleaseNotesCommandArgs = {
  runId?: string;
  projectDescription: string;
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
      .option("projectDescription", {
        type: "string",
        demandOption: true,
        description:
          "A text description of the project. This helps contextualize the release notes.",
      });
    // .option("releaseVersion", {
    //   type: "string",
    //   demandOption: true,
    //   description: "The release to generate release notes for.",
    // })
    // .option("previousReleaseVersion", {
    //   type: "string",
    //   demandOption: true,
    //   description:
    //     "The last release before this release. Sets a lower bound on context for the release notes.",
    // });
  },
  async handler(args) {
    logger = makeRunLogger({
      topic: "GenerateReleaseNotes",
      runId: args.runId,
    });
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    const result = await withConfig(action, args);
    logger.logInfo(`Success`);
    await logger.flushArtifacts();
    await logger.flushLogs();
    return result;
  },
  describe: "TODO",
});

export const action = createConfiguredAction<GenerateReleaseNotesCommandArgs>(
  async (
    //
    { jiraApi, githubApi },
    { projectDescription }
  ) => {
    logger.logInfo(`Setting up...`);
    // const generate = makeGenerateChatCompletion();

    const data = await jiraApi?.getIssue("EAI-123");
    console.log("data", data);

    const gh = await githubApi?.pulls.get({
      owner: "mongodb",
      repo: "chatbot",
      pull_number: 405,
    });
    console.log("gh", Object.keys(gh as any));

    const gh_diff = await githubApi?.pulls.get({
      owner: "mongodb",
      repo: "chatbot",
      pull_number: 405,
      mediaType: {
        format: "diff",
      },
    });
    console.log("gh_diff", Object.keys(gh_diff as any));
  }
);
