import {
  EmbeddedContent,
  FindContentFunc,
  updateFrontMatter,
  Reference,
  logger,
} from "mongodb-rag-core";
import { Tool, tool, TypedToolResult } from "mongodb-rag-core/aiSdk";
import { z } from "zod";
import {
  mongoDbProducts,
  mongoDbProgrammingLanguageIds,
} from "mongodb-rag-core/mongoDbMetadata";
import { makeMarkdownNumberedList } from "mongodb-rag-core/dataSources";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { MakeReferenceLinksFunc } from "mongodb-chatbot-server";

export const MongoDbSearchToolArgsSchema = z.object({
  productName: z
    .enum(mongoDbProducts.map((product) => product.id) as [string, ...string[]])
    .nullable()
    .optional()
    .describe("Most relevant MongoDB product for query. Leave null if unknown"),
  programmingLanguage: z
    .enum(mongoDbProgrammingLanguageIds)
    .nullable()
    .optional()
    .describe(
      "Most relevant programming language for query. Leave null if unknown"
    ),
  query: z.string().describe("Search query"),
});

export type MongoDbSearchToolArgs = z.infer<typeof MongoDbSearchToolArgsSchema>;

export type SearchResult = Partial<EmbeddedContent> & {
  url: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export const SEARCH_TOOL_NAME = "search_content";

export type SearchToolReturnValue = {
  results: SearchResult[];
  references?: Reference[];
};

export type SearchTool = Tool<MongoDbSearchToolArgs, SearchToolReturnValue>;

export type SearchToolResult = TypedToolResult<{
  [SEARCH_TOOL_NAME]: SearchTool;
}>;

export interface MakeSearchToolParams {
  findContent: FindContentFunc;
  makeReferences: MakeReferenceLinksFunc;
}

const searchContentToolNotes = [
  "Search all of the available MongoDB reference documents for a given user input.",
  "You must generate an appropriate search query for a given user input.",
  "You are doing this for MongoDB, and all queries relate to MongoDB products.",
  `Only generate ONE ${SEARCH_TOOL_NAME} tool call per user message unless there are clearly multiple distinct queries needed to answer the user query.`,
];

export function makeSearchTool({
  findContent,
  makeReferences,
}: MakeSearchToolParams): SearchTool {
  const searchTool: SearchTool = tool({
    inputSchema: MongoDbSearchToolArgsSchema,
    description: `Search MongoDB content. Use the ${SEARCH_TOOL_NAME} tool as follows:

${makeMarkdownNumberedList(searchContentToolNotes)}
    
When you search, include metadata about the relevant MongoDB programming language and product.`,

    toModelOutput(result) {
      return {
        type: "content",
        value: [
          {
            type: "text",
            text: JSON.stringify({
              results: result.results.map(searchResultToLlmContent),
            }),
          },
        ],
      };
    },
    execute: wrapTraced(
      async function (
        args: MongoDbSearchToolArgs
      ): Promise<SearchToolReturnValue> {
        const { query, productName, programmingLanguage } = args;

        const nonNullMetadata: Record<string, string> = {};
        if (productName) {
          nonNullMetadata.productName = productName;
        }
        if (programmingLanguage) {
          nonNullMetadata.programmingLanguage = programmingLanguage;
        }

        const queryWithMetadata = updateFrontMatter(query, nonNullMetadata);
        const content = await findContent({ query: queryWithMetadata });

        const result: SearchToolReturnValue = {
          results: content.content.map(embeddedContentToSearchResult),
          references: makeReferences(content.content),
        };
        logger.info(
          `${SEARCH_TOOL_NAME} found ${content.content.length} search results for query "${queryWithMetadata}"`
        );

        return result;
      },
      {
        name: "searchTool",
      }
    ),
  });

  return searchTool;
}

export function embeddedContentToSearchResult(
  content: EmbeddedContent
): SearchResult {
  return {
    url: content.url,
    metadata: {
      pageTitle: content.metadata?.pageTitle,
      sourceName: content.sourceName,
    },
    text: content.text,
  };
}

export function searchResultToLlmContent(result: SearchResult): SearchResult {
  return {
    url: result.url,
    text: result.text,
  };
}
