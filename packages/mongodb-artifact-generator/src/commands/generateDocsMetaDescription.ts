import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { makeRunLogger, type RunLogger } from "../runlogger";
import PromisePool from "@supercharge/promise-pool";
import { urlToFilename } from "../utils";
import {
  DocsMetadata,
  makeGenerateDocsMetadata,
} from "../docs-metadata/generateMetadata";

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
        coerce: (url: string | string[]) => {
          const urls = Array.isArray(url) ? url : [url];
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
        default: 5,
        description:
          "The maximum number of concurrent requests to the LLM API.",
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
      const hrefs = urls.map((url) => url.href);
      logger.logInfo(hrefs.join("\n"));
      const pages = await pageStore.loadPages({
        query: {
          url: { $in: hrefs },
          sourceName: /^snooty/,
        },
      });
      logger.logInfo(`Loaded ${pages.length} pages.`);

      const generateDocsMetadata = makeGenerateDocsMetadata({
        openAiClient,
        logger,
      });

      const start = new Date();
      console.log("Beginning generation at", start.toISOString());
      const results = new Map<string, DocsMetadata["description"]>();
      await PromisePool.for(pages)
        .withConcurrency(llmMaxConcurrency)
        .handleError((error, page) => {
          logger.logError(
            `Error generating meta description for page ${page.url}: ${error.message}`
          );
        })
        .process(async (page, i) => {
          console.log(
            `(${i + 1}/${pages.length}) Generating meta description for page ${
              page.url
            }`
          );
          logger.logInfo(`Generating meta description for page ${page.url}...`);
          const text = page.body;
          const metadata = await generateDocsMetadata({
            text,
            url: page.url,
          });
          results.set(page.url, metadata.description);
          logger.appendArtifact(
            `generateDocsMetadata/${urlToFilename(page.url)}.json`,
            JSON.stringify({
              url: page.url,
              metadata,
              text,
            })
          );
          logger.logInfo(
            `Generated meta description for page ${page.url}: ${metadata.description}`
          );
        });

      logger.logInfo(`Generated meta descriptions for ${results.size} pages.`);
      const end = new Date();
      const duration = end.getTime() - start.getTime();
      console.log(
        "Finished generation at",
        end.toISOString(),
        `(${duration}ms)`
      );

      const json = JSON.stringify(
        Object.fromEntries(results.entries()),
        null,
        2
      );
      logger.appendArtifact("metaDescriptions.json", json);

      const csv = [["url", "metaDescription"], ...Array.from(results.entries())]
        .map(([k, v]) => [k, v.includes(",") ? `"${v}"` : v].join(","))
        .join("\n");

      logger.appendArtifact("metaDescriptions.csv", csv);
    }
  );
