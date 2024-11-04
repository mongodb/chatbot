import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { promises as fs } from "fs";
import { stripIndents, html } from "common-tags";
import { makeFindContent } from "../vectorSearch";
import { makeGenerateChatCompletion } from "../chat";
import { summarize, translate } from "../operations";
import { makeRunLogger, type RunLogger } from "../runlogger";
import { stringifyVectorSearchChunks } from "../prompt";
import path from "path";
import { ObjectId } from "mongodb-rag-core/mongodb";

let logger: RunLogger;

type TranslateCodeCommandArgs = {
  runId?: string;
  source: string;
  targetDescription: string;
  targetFileExtension?: string;
  outputPath?: string;
  outputFilename?: string;
};

export default createCommand<TranslateCodeCommandArgs>({
  command: "translateCode",
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
        description: "The path of the source code file to translate.",
      })
      .option("targetDescription", {
        type: "string",
        demandOption: true,
        description: "A text description of the desired output.",
      })
      .option("targetFileExtension", {
        type: "string",
        demandOption: false,
        description: "The file extension. Defaults to .txt.",
      })
      .option("outputPath", {
        type: "string",
        demandOption: false,
        description:
          "A file path to prepend to the output file name. If not specified, outputs only the file name.",
      })
      .option("outputFilename", {
        type: "string",
        demandOption: false,
        description:
          "The name of the output file. If not specified, uses the input file name.",
      });
  },
  async handler(args) {
    logger = makeRunLogger({
      topic: "translateCode",
      runId: args.runId,
    });
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    const result = await withConfig(action, args);
    logger.logInfo(`Success`);
    await logger.flushLogs();
    await logger.flushArtifacts();
    return result;
  },
  describe: "Translate a source code file into a new context.",
});

export const action = createConfiguredAction<TranslateCodeCommandArgs>(
  async (
    { embeddedContentStore, embedder },
    {
      source,
      targetDescription,
      targetFileExtension = "txt",
      outputPath,
      outputFilename,
      runId = new ObjectId().toHexString(),
    }
  ) => {
    const sourceCode = await fs.readFile(source, "utf8");

    if (!logger) {
      logger = makeRunLogger({
        topic: "translateCode",
        runId,
      });
    }

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
      const analyzePageOutput = await summarize({
        generate,
        sourceCode,
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
      const transformed = await translate({
        generate,
        searchResults,
        sourceCode,
        sourceDescription: analyzePageOutput,
        targetDescription: html`
          A source code file with the same functionality and content as the
          original source code but in a new context.

          ${targetDescription}
        `,
      });

      logger.logInfo(`Created output:\n\n${transformed}\n`);

      const inputFileName = path.parse(source).name;
      const outputFileName = `${
        outputFilename ?? inputFileName
      }.translated.${targetFileExtension}`;
      const outputFilePath = outputPath
        ? path.join(outputPath, outputFileName)
        : outputFileName;
      logger.appendArtifact(outputFilePath, transformed);
      logger.flushLogs();
      logger.flushArtifacts();
    } finally {
      await cleanupFindContent();
    }
  }
);
