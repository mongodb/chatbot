import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { promises as fs } from "fs";
import { html, stripIndents } from "common-tags";
import { makeFindContent } from "../vectorSearch";
import { makeGenerateChatCompletion } from "../chat";
import { summarizePage, translatePage } from "../operations";
import {
  makeRunLogger,
} from "../runlogger";
import { rstDescription, stringifyVectorSearchChunks } from "../prompt";

const logger = makeRunLogger({ topic: "translateCode" });

type TranslateCodeCommandArgs = {
  source: string;
  targetDescription: string;
};

export default createCommand<TranslateCodeCommandArgs>({
  command: "translateCode",
  builder(args) {
    return withConfigOptions(args)
      .option("source", {
        type: "string",
        demandOption: true,
        description: "The path of the documentation file to translate.",
      })
      .option("targetDescription", {
        type: "string",
        demandOption: true,
        description: "A text description of the desired output.",
      });
  },
  async handler(args) {
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    const result = await withConfig(action, args);
    logger.logInfo(`Success`);
    await logger.flushLogs();
    await logger.flushArtifacts();
    return result;
  },
  describe: "Translate a documentation page into a new context.",
});

export const action = createConfiguredAction<TranslateCodeCommandArgs>(
  async (
    { embeddedContentStore, embedder },
    { source, targetDescription }
  ) => {
    const sourcePage = await fs.readFile(source, "utf8");

    console.log(`Setting up...`);
    const generate = makeGenerateChatCompletion();
    const { findContent, cleanup: cleanupFindContent } = makeFindContent({
      embedder,
      embeddedContentStore,
      findNearestNeighborsOptions: {
        k: 3,
        minScore: 0.85,
      },
    });

    try {
      console.log(`Analyzing page...`);
      const analyzePageOutput = await summarizePage({
        generate,
        sourcePage,
      });
      console.log(`Input analysis:\n\n${analyzePageOutput}\n`);

      console.log(`Finding Relevant Content...`);
      // Find content in the existing off-site docs if we have them
      // e.g. if the target is C++ then we'd want to find content from https://mongocxx.org
      // e.g. if the target is PHP then we'd want to find content from https://www.mongodb.com/developer/languages/php, https://mongodb.com/docs/drivers/php, etc
      const { content } = await findContent({
        // query: "How does the driver version API and ABI?",
        query: analyzePageOutput,
      });
      // Log the search results
      // TODO: run the search results through a preprocessor that summarizes them in a useful way for this process
      const searchResults = stringifyVectorSearchChunks(content).join("\n");
      console.log(searchResults);
      console.log(`Logged ${searchResults.length} search result chunks`);

      console.log(`Transforming page...`);
      const transformed = await translatePage({
        generate,
        searchResults,
        sourcePage,
        sourceDescription: analyzePageOutput,
        targetDescription: stripIndents`
            A new code example with the same functionality as the source page but in a new context.

            ${
              !targetDescription
                ? ""
                : stripIndents`
              The user provided the following description of the desired output:

              ${targetDescription}
            `
            }
          `,
      });

      console.log(`Created output:\n\n${transformed}\n`);
      console.log("writing");
      await fs.writeFile("./output-translateCode.txt", transformed);
      console.log("written");
    } finally {
      await cleanupFindContent();
    }
  }
);
