import { z } from "zod";
import { FindContentFunc, MongoDbPageStore, Reference } from "mongodb-rag-core";
import { normalizeUrl } from "mongodb-rag-core/dataSources";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { Tool, tool, ToolExecutionOptions } from "mongodb-rag-core/aiSdk";
import { addReferenceSourceType } from "../processors/makeMongoDbReferences";

export const FETCH_PAGE_TOOL_NAME = "fetch_page";

export const MongoDbFetchPageToolArgsSchema = z.object({
  pageUrl: z.string().describe("URL of page to fetch"),
  query: z.string().describe("Search query"),
});

export type MongoDbFetchPageToolArgs = z.infer<
  typeof MongoDbFetchPageToolArgsSchema
>;

export type FetchPageToolResult = {
  url: string;
  text: string;
  reference?: Reference;
};

export type FetchPageTool = Tool<
  typeof MongoDbFetchPageToolArgsSchema,
  FetchPageToolResult
> & {
  execute: (
    args: MongoDbFetchPageToolArgs,
    options: ToolExecutionOptions
  ) => PromiseLike<FetchPageToolResult>;
};

export function makeFetchPageTool(
  loadPage: MongoDbPageStore["loadPage"],
  findContent: FindContentFunc
): FetchPageTool {
  return tool({
    parameters: MongoDbFetchPageToolArgsSchema,
    description: "Fetch all content for a specific URL",
    experimental_toToolResultContent(result) {
      return [{ type: "text", text: result.text }];
    },
    execute: wrapTraced(
      async function (
        args: MongoDbFetchPageToolArgs,
        _options: ToolExecutionOptions
      ): Promise<FetchPageToolResult> {
        // TODO Comment in once ingestion is normalized too
        const normalizedUrl = args.pageUrl; //normalizeUrl(args.pageUrl);
        const page = await loadPage({
          urls: [normalizedUrl],
          query: {
            action: {
              $ne: "deleted",
            },
          },
        });

        let text: string;
        let reference: Reference | undefined;
        if (page === null) {
          // Fall back - no page for this URL
          text = "{fallback_to_search}";
        } else if (page.body.length < 150000) {
          // Page content is short enough, return it directly
          text = page.body;
          reference = {
            url: normalizedUrl,
            title: page.title ?? normalizedUrl,
            metadata: {
              ...(page.metadata ?? {}),
              sourceName: page.sourceName,
            },
          };
        } else {
          // Page content is too long, do truncate-search
          const relevantPageContent = await findContent({
            query: args.query,
            filters: { url: normalizedUrl },
          });
          reference = {
            url: normalizedUrl,
            title: page.title ?? normalizedUrl,
            metadata: {
              ...(page.metadata ?? {}),
              sourceName: page.sourceName,
            },
          };
          if (relevantPageContent.content.length > 0) {
            const relevantContentText = relevantPageContent.content
              .map((c) => c.text)
              .join("\n");
            text = relevantContentText + page.body.slice(0, 150000);
          } else {
            text = page.body.slice(0, 150000);
          }
        }
        return {
          url: normalizedUrl,
          text,
          reference: reference ? addReferenceSourceType(reference) : undefined,
        };
      },
      {
        name: "fetchPageTool",
      }
    ),
  });
}
