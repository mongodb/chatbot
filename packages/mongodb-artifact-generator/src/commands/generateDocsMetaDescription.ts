import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { makeRunLogger, type RunLogger } from "../runlogger";
import PromisePool from "@supercharge/promise-pool";
import { makeGenerateMetaDescription } from "../docs-meta-descriptions/generateMetaDescription";
import { urlToFilename } from "../utils";

let logger: RunLogger;

type GenerateDocsMetaDescriptionCommandArgs = {
  runId?: string;
  llmMaxConcurrency: number;
  url: URL[];
};

export default createCommand<GenerateDocsMetaDescriptionCommandArgs>({
  command: "generateDocsMetaDescription",
  builder(args) {
    return withConfigOptions(args)
      .option("runId", {
        type: "string",
        demandOption: false,
        description:
          "A unique name for the run. This controls where outputs artifacts and logs are stored.",
      })
      .option("url", {
        type: "string",
        demandOption: true,
        description:
          "The URL of the page to generate a meta description for. It must be a valid URL that exists in the EAI knowledge base.",
        coerce: (urls: string[]) => {
          return urls.map((url) => {
            try {
              return new URL(url);
            } catch (e) {
              throw new Error(`Invalid page URL: ${url}`);
            }
          });
        },
      })
      .option("llmMaxConcurrency", {
        type: "number",
        demandOption: false,
        default: 10,
        description:
          "The maximum number of concurrent requests to the LLM API. Defaults to 10.",
      });
  },
  async handler(args) {
    logger = makeRunLogger({
      topic: "GenerateDocsMetaDescription",
      runId: args.runId,
    });
    const loggerFlushInterval = setInterval(async () => {
      await logger.flushArtifacts();
    }, 200);
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    try {
      const result = await withConfig(action, args);
      logger.logInfo(`Success`);
      return result;
    } finally {
      clearInterval(loggerFlushInterval);
      await logger.flushArtifacts();
      await logger.flushLogs();
    }
  },
  describe: "[WIP] Generate docs MetaDescription.",
});

export const action =
  createConfiguredAction<GenerateDocsMetaDescriptionCommandArgs>(
    async ({ pageStore, openAiClient }, { url: urls, llmMaxConcurrency }) => {
      logger.logInfo(`Setting up...`);

      if (!openAiClient) {
        throw new Error(
          "openAiClient is required. Make sure to define it in the config."
        );
      }

      logger.logInfo(`Loading ${urls.length} pages from the page store...`);
      logger.logInfo(urls.map((url) => url.href).join("\n"));
      const pages = await pageStore.loadPages({
        urls: urls.map((url) => url.href),
      });
      logger.logInfo(`Loaded ${pages.length} pages.`);

      const generateMetaDescription = makeGenerateMetaDescription({
        openAiClient,
        logger,
      });

      const results = new Map<string, string>();
      await PromisePool.for(pages)
        .withConcurrency(llmMaxConcurrency)
        .handleError((error, page) => {
          logger.logError(
            `Error generating meta description for page ${page.url}: ${error.message}`
          );
        })
        .process(async (page) => {
          logger.logInfo(`Generating meta description for page ${page.url}...`);
          const text = page.body;
          const metaDescription = await generateMetaDescription({
            text,
            url: page.url,
          });
          results.set(page.url, metaDescription);
          logger.appendArtifact(
            `${urlToFilename(page.url)}.json`,
            metaDescription
          );
          logger.logInfo(
            `Generated meta description for page ${page.url}: ${metaDescription}`
          );
        });

      logger.logInfo(`Generated meta descriptions for ${results.size} pages.`);

      const json = JSON.stringify(
        Object.fromEntries(results.entries()),
        null,
        2
      );
      logger.appendArtifact("metaDescriptions.json", json);

      const csv = [["url", "metaDescription"], ...Array.from(results.entries())]
        .map((row) => row.join(","))
        .join("\n");

      logger.appendArtifact("metaDescriptions.csv", csv);
    }
  );
