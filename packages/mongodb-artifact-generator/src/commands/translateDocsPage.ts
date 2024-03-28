import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { promises as fs } from "fs";
import { stripIndents } from "common-tags";
import { makeFindContent } from "../vectorSearch";
import { makeGenerateChatCompletion } from "../chat";
import { rewriteAsRst, summarizePage, translatePage } from "../operations";
import { makeRunLogger, type RunLogger } from "../runlogger";
import { rstDescription, stringifyVectorSearchChunks } from "../prompt";
import path from "path";

let logger: RunLogger;

type TranslateDocsPageCommandArgs = {
  runId?: string;
  source: string;
  targetDescription: string;
};

export default createCommand<TranslateDocsPageCommandArgs>({
  command: "translateDocsPage",
  builder(args) {
    return withConfigOptions(args)
      .option("runId", {
        type: "string",
        demandOption: false,
        description: "A (hopefully unique) name for the run.",
      })
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
    logger = makeRunLogger({
      topic: "translateDocsPage",
      runId: args.runId,
    });
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    const result = await withConfig(action, args);
    logger.logInfo(`Success`);
    await logger.flushLogs();
    await logger.flushArtifacts();
    return result;
  },
  describe: "Translate a documentation page into a new context.",
});

export const action = createConfiguredAction<TranslateDocsPageCommandArgs>(
  async ({ embeddedContentStore, embedder }, { source, targetDescription }) => {
    const sourcePage = await fs.readFile(source, "utf8");

    logger.logInfo(`Setting up...`);
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
      logger.logInfo(`Analyzing page...`);
      const analyzePageOutput = await summarizePage({
        generate,
        sourcePage,
      });
      logger.logInfo(`Input analysis:\n\n${analyzePageOutput}\n`);

      logger.logInfo(`Finding Relevant Content...`);
      // Find content in the existing off-site docs if we have them
      // e.g. if the target is C++ then we'd want to find content from https://mongocxx.org
      // e.g. if the target is PHP then we'd want to find content from https://www.mongodb.com/docs/php-library/current/
      const { content } = await findContent({
        // query: "How does the driver version API and ABI?",
        query: analyzePageOutput,
      });
      // Log the search results
      // TODO: run the search results through a preprocessor that summarizes them in a useful way for this process
      const vectorSearchResults = stringifyVectorSearchChunks(content);
      const searchResults = vectorSearchResults.join("\n");
      console.log(searchResults);
      logger.logInfo(
        stripIndents`
          Found ${vectorSearchResults.length} search result chunks:
          ${vectorSearchResults}
        `
      );

      logger.logInfo(`Transforming page...`);
      const transformed = await translatePage({
        generate,
        searchResults,
        sourcePage,
        sourceDescription: analyzePageOutput,
        targetDescription: stripIndents`
            A documentation page covering the same topics and content as the source page but in a new context.
            The page should use well-formatted reStructuredText markup, not Markdown or another markup language.

            ${rstDescription}

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

      logger.logInfo(`Created output:\n\n${transformed}\n`);
      const inputFileName = path.parse(source).name;
      logger.appendArtifact(`${inputFileName}.translated.rst`, transformed);

      const rstPostProcessed = await rewriteAsRst({
        page: transformed,
        pageSummary: analyzePageOutput,
      });

      logger.appendArtifact(
        `${inputFileName}-rstPostProcessorTest.translated.rst`,
        rstPostProcessed
      );
    } finally {
      await cleanupFindContent();
    }
  }
);
