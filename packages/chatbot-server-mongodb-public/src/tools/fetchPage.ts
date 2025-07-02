import { z } from "zod";
import { FindContentFunc, MongoDbPageStore, Reference } from "mongodb-rag-core";
import { normalizeUrl } from "mongodb-rag-core/dataSources";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { Tool, tool, ToolExecutionOptions } from "mongodb-rag-core/aiSdk";
import { addReferenceSourceType } from "../processors/makeMongoDbReferences";

export const FETCH_PAGE_TOOL_NAME = "fetch_page";
export const SEARCH_ALL_FALLBACK_TEXT = "{fallback_to_search}";
const SEARCH_ON_PAGE_LENGTH_CUTOFF = 150000;

export const MongoDbFetchPageToolArgsSchema = z.object({
  pageUrl: z.string().describe("URL of page to fetch"),
  query: z.string().describe("Search query"),
});

export type MongoDbFetchPageToolArgs = z.infer<
  typeof MongoDbFetchPageToolArgsSchema
>;

export type FetchPageToolResult = {
  text: string;
  references?: Reference[];
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

export interface MakeFetchPageToolParams {
  loadPage: MongoDbPageStore["loadPage"];
  findContent: FindContentFunc;
  searchFallbackText?: string;
  pageLengthCutoff?: number;
}

export function makeFetchPageTool({
  loadPage,
  findContent,
  searchFallbackText = SEARCH_ALL_FALLBACK_TEXT,
  pageLengthCutoff = SEARCH_ON_PAGE_LENGTH_CUTOFF,
}: MakeFetchPageToolParams): FetchPageTool {
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
        const normalizedUrl = normalizeUrl(args.pageUrl);
        const page = await loadPage({
          urls: [normalizedUrl],
          query: {
            action: {
              $ne: "deleted",
            },
          },
        });
        const { text, reference } = await getPageContent(
          page,
          pageLengthCutoff,
          searchFallbackText,
          findContent,
          args.query,
          normalizedUrl
        );
        return {
          text,
          references: reference
            ? [addReferenceSourceType(reference)]
            : undefined,
        };
      },
      {
        name: "fetchPageTool",
      }
    ),
  });
}

async function getPageContent(
  page: Awaited<ReturnType<MongoDbPageStore["loadPage"]>>,
  pageLengthCutoff: number,
  searchFallbackText: string,
  findContent: FindContentFunc,
  query: string,
  normalizedUrl: string
): Promise<{
  text: string;
  reference?: Reference;
}> {
  if (page === null) {
    // Fall back - no page for this URL
    return { text: searchFallbackText };
  }
  if (page.body.length < pageLengthCutoff) {
    // Page content is short enough, return it directly
    return {
      text: page.body,
      reference: {
        url: normalizedUrl,
        title: page.title ?? normalizedUrl,
        metadata: {
          ...(page.metadata ?? {}),
          sourceName: page.sourceName,
        },
      },
    };
  }

  // Page content is too long, do truncate-search
  const mostRelevantChunks = await findContent({
    query: query,
    filters: { url: normalizedUrl },
  });
  const reference = {
    url: normalizedUrl,
    title: page.title ?? normalizedUrl,
    metadata: {
      ...(page.metadata ?? {}),
      sourceName: page.sourceName,
    },
  };
  if (mostRelevantChunks.content.length > 0) {
    const searchResultsText = mostRelevantChunks.content.map(
      (c) => `
<result> 
${c.text} 
</result>`
    );

    const text = `<search_results>

Search results from page ${normalizedUrl}

${searchResultsText}
</search_results>

<truncated_page>
${page.body.slice(0, pageLengthCutoff)}
</truncated_page>
`;
    return { text, reference };
  }
  const text = page.body.slice(0, pageLengthCutoff);
  return { text, reference };
}
