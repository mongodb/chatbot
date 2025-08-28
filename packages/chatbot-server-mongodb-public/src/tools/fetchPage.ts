import { z } from "zod";
import {
  FindContentFunc,
  logger,
  MongoDbPageStore,
  Reference,
} from "mongodb-rag-core";
import { MakeReferenceLinksFunc } from "mongodb-chatbot-server";
import {
  normalizeUrl,
  makeMarkdownNumberedList,
} from "mongodb-rag-core/dataSources";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { Tool, tool } from "mongodb-rag-core/aiSdk";

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

export type FetchPageTool = Tool<MongoDbFetchPageToolArgs, FetchPageToolResult>;

export interface MakeFetchPageToolParams {
  loadPage: MongoDbPageStore["loadPage"];
  findContent: FindContentFunc;
  makeReferences: MakeReferenceLinksFunc;
  searchFallbackText?: string;
  pageLengthCutoff?: number;
}

const fetchPageToolNotes = [
  `Remember - do not assume that the user wants to use the ${FETCH_PAGE_TOOL_NAME} based on the pageUrl in the Front Matter. Only call this tool when specifically instructed to use a certain page.`,
  `If the user provides multiple URLs in their query, call the ${FETCH_PAGE_TOOL_NAME} once for each URL, and do not call the ${FETCH_PAGE_TOOL_NAME} for the URL in the Front Matter.`,
  "Sometimes, when a page is very long, a search will be performed over the page. Therefore, you must also provide a search query to the tool.",
  "Do not include URLs in the search query.",
];

export function makeFetchPageTool({
  loadPage,
  findContent,
  makeReferences,
  searchFallbackText = SEARCH_ALL_FALLBACK_TEXT,
  pageLengthCutoff = SEARCH_ON_PAGE_LENGTH_CUTOFF,
}: MakeFetchPageToolParams): FetchPageTool {
  return tool({
    inputSchema: MongoDbFetchPageToolArgsSchema,
    description: `Fetches the entire page contents for a specific URL. Use this tool as follows:

${makeMarkdownNumberedList(fetchPageToolNotes)}`,
    toModelOutput(output) {
      return {
        type: "content",
        value: [{ type: "text", text: output.text }],
      };
    },
    execute: wrapTraced(
      async function (
        args: MongoDbFetchPageToolArgs
      ): Promise<FetchPageToolResult> {
        const normalizedUrl = normalizeUrl({ url: args.pageUrl });
        const page = await loadPage({
          urls: [normalizedUrl],
          query: {
            action: {
              $ne: "deleted",
            },
          },
        });
        return await getPageContent(
          page,
          pageLengthCutoff,
          searchFallbackText,
          findContent,
          makeReferences,
          args.query,
          normalizedUrl
        );
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
  makeReferences: MakeReferenceLinksFunc,
  query: string,
  normalizedUrl: string
): Promise<{
  text: string;
  references?: Reference[];
}> {
  if (page === null) {
    // Fall back - no page for this URL
    logger.info(
      `${FETCH_PAGE_TOOL_NAME} did not find a page for URL ${normalizedUrl}`
    );
    return { text: searchFallbackText };
  }
  logger.info(`${FETCH_PAGE_TOOL_NAME} found a page for URL ${normalizedUrl}.`);
  const referenceContent: Parameters<typeof makeReferences>[0][number] = {
    url: page.url,
    text: page.body,
    metadata: {
      ...page.metadata,
      sourceName: page.sourceName,
      pageTitle: page.title,
    },
    sourceName: page.sourceName,
    updated: page.updated,
  };

  if (page.body.length < pageLengthCutoff) {
    // Page content is short enough, return it directly
    return {
      text: page.body,
      references: makeReferences([referenceContent]),
    };
  }
  // Page content is too long, do truncate-search
  logger.info(
    `Page for ${normalizedUrl} is very long, truncating and searching for most relevant content`
  );
  const references = makeReferences([referenceContent]);
  const mostRelevantChunks = await findContent({
    query: query,
    filters: { url: normalizedUrl },
  });
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
    return { text, references };
  }
  const text = page.body.slice(0, pageLengthCutoff);
  return { text, references };
}
