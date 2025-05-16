import { Page } from "mongodb-rag-core";
import { OpenAI } from "mongodb-rag-core/openai";
import {
  getSnootyTableOfContents,
  LocallySpecifiedSnootyProjectConfig,
  prepareSnootySources,
} from "../sources/snooty";
import { makeGeneratePageSummary } from "./generatePageSummary";
import PromisePool from "@supercharge/promise-pool";
import { LlmOptions } from "./LlmOptions";

export type MakeGenerateSnootySiteMaxxPromptParams = {
  openAiClient: OpenAI;
};

export interface GenerateMakeSnootySiteMaxxPromptParams {
  topic: string;
  topicDescription?: string;
  customInstructions?: string;
  maxChunkSize?: number;
  percentToInclude?: number;
  options: LlmOptions;
  maxConcurrency?: number;
  snooty: {
    dataSource: LocallySpecifiedSnootyProjectConfig;
    entryUrl?: string;
    filter?(page: Page): boolean;
  };
}

export function makeGenerateSnootySiteMaxxPrompt({
  openAiClient,
}: MakeGenerateSnootySiteMaxxPromptParams) {
  const generatePageSummary = makeGeneratePageSummary({
    openAiClient,
  });
  return async function generateSnootySiteMaxxPrompt({
    topic,
    topicDescription,
    customInstructions,
    maxChunkSize,
    percentToInclude,
    options,
    snooty,
    maxConcurrency = 10,
  }: GenerateMakeSnootySiteMaxxPromptParams) {
    console.log("Preparing snooty source", snooty.dataSource);
    const [dataSource] = await prepareSnootySources({
      projects: [snooty.dataSource],
      snootyDataApiBaseUrl: "https://snooty-data-api.mongodb.com/prod/",
    });
    const pages = await dataSource.fetchPages();
    console.log("Fetched pages", pages.length);
    // Precompute page map for faster lookup
    const pageMap = pages.reduce((acc, page) => {
      acc[page.url] = page;
      return acc;
    }, {} as Record<string, Page>);

    const tableOfContents = await getSnootyTableOfContents({
      baseUrl: dataSource._baseUrl,
      currentBranch: dataSource._currentBranch,
      pages,
      snootyProjectName: dataSource._snootyProjectName,
    });
    console.log(
      `Got table of contents for site ${dataSource._snootyProjectName} with first url: ${tableOfContents?.toctreeOrder[0]}`
    );
    if (!tableOfContents) {
      throw new Error("Failed to get table of contents");
    }
    // FIXME: this doesn't work on a real snooty site even though the tests pass.
    // Working around with a hackier solution
    // const flattenedTableOfContents = flattenTableOfContents(
    //   tableOfContents.toc,
    //   snooty.entryUrl,
    //   pageMap
    // );
    const flattenedTableOfContents = tableOfContents.toctreeOrder.map(
      (url) => ({ url })
    );

    console.log(
      "Flattened table of contents length",
      flattenedTableOfContents.length
    );
    console.log("a few pages:", flattenedTableOfContents.slice(0, 5));
    console.log(
      `Flattened table of contents for site ${
        dataSource._snootyProjectName
      } with first few urls: ${flattenedTableOfContents
        ?.slice(0, 5)
        .map((entry) => entry.url)
        .join(", ")}`
    );

    const visitedUrls = new Set<string>();
    const pagesToSummarize = flattenedTableOfContents
      .filter((entry) => {
        if (visitedUrls.has(entry.url)) {
          return false;
        }
        visitedUrls.add(entry.url);
        return true;
      })
      .map((entry) => {
        const page = pageMap[entry.url];
        return page;
      })
      .filter((page): page is Page => {
        // Filter out undefined/null pages (those not found in pageMap)
        if (!page) {
          return false;
        }
        // Apply the custom filter if provided, otherwise use default isMdPage filter
        return snooty.filter ? snooty.filter(page) : isMdPage(page);
      });
    console.log(`Summarizing ${pagesToSummarize.length} pages with LLM`);
    const { results: summaries, errors } = await PromisePool.for(
      pagesToSummarize.map((page, i) => ({
        page,
        i,
      }))
    )
      .withConcurrency(maxConcurrency)
      .handleError((error) => {
        console.error(error);
      })
      .process(async ({ page, i }) => {
        console.log(`Summarizing page ${i}`);
        console.log(`Page body length: ${page.body.length}`);
        const summary = await generatePageSummary({
          page,
          topic,
          maxChunkSize,
          percentToInclude,
          options,
          customInstructions,
        });
        console.log(`Summary length: ${summary.length}`);
        return {
          page,
          summary,
          i,
        };
      });
    console.log(`Successfully summarized ${summaries.length} pages with LLM`);
    console.log(`Failed to summarize ${errors.length} pages with LLM`);
    const pageSummaries = summaries
      .sort((a, b) => a.i - b.i)
      .map(({ page, summary }) => makePromptPage(page, summary))
      .join("\n");

    return `<guide>
<guide_topic>${topic}</guide_topic>${
      topicDescription
        ? `\n<guide_description>${topicDescription}</guide_description>`
        : ""
    }

${pageSummaries}
</guide>`;
  };
}

export function isMdPage(page: Page): boolean {
  return page.format === "md";
}

function makePromptPage(page: Page, summary: string): string {
  return `<section>
<title>${page.title}</title>
<url>${page.url}</url>${
    page.metadata?.page?.description
      ? `\n<description>${page.metadata?.page?.description}</description>\n`
      : ""
  }

${summary}

</section>`;
}
