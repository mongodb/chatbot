import { FindContentFunc, MongoDbPageStore } from "mongodb-rag-core";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { Tool, tool, ToolExecutionOptions } from "mongodb-rag-core/aiSdk";
import { z } from "zod";

export const FETCH_PAGE_TOOL_NAME = "fetch_page";

export const MongoDbFetchPageToolArgsSchema = z.object({
  pageUrl: z.string().describe("URL of page to fetch"),
  query: z.string().describe("Search query"),
});

export type MongoDbFetchPageToolArgs = z.infer<
  typeof MongoDbFetchPageToolArgsSchema
>;

export type FetchPageTool = Tool<
  typeof MongoDbFetchPageToolArgsSchema,
  string
> & {
  execute: (
    args: MongoDbFetchPageToolArgs,
    options: ToolExecutionOptions
  ) => PromiseLike<string>;
};

export function normalizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export function makeFetchPageTool(
  pageStore: MongoDbPageStore,
  findContent: FindContentFunc
): FetchPageTool {
  return tool({
    parameters: MongoDbFetchPageToolArgsSchema,
    description: "Fetch all content for a specific URL",
    execute: wrapTraced(
      async function (
        args: MongoDbFetchPageToolArgs,
        _options: ToolExecutionOptions
      ): Promise<string> {
        const normalizedUrl = normalizeUrl(args.pageUrl);
        const page = await pageStore.loadPage({
          urls: [normalizedUrl],
          query: {
            action: {
              $ne: "deleted",
            },
          },
        });

        if (page === null) {
          // Fall back - no page for this URL
          return "{fallback_to_search}";
        }
        if (page.body.length > 150000) {
          // Page content is too long, do cutoff-search
          const relevantPageContent = await findContent({
            query: args.query,
            filters: { url: normalizedUrl },
          });
          if (relevantPageContent.content.length > 0) {
            const relevantContentText = relevantPageContent.content
              .map((c) => c.text)
              .join("\n");
            return relevantContentText + page.body.slice(0, 150000);
          }
          return page.body.slice(0, 150000);
        }
        return page.body;
      },
      {
        name: "fetchPageTool",
      }
    ),
  });
}
