import {
  EmbeddedContent,
  FindContentFunc,
  updateFrontMatter,
} from "mongodb-rag-core";
import {
  Tool,
  tool,
  ToolExecutionOptions,
  ToolResultUnion,
} from "mongodb-rag-core/aiSdk";
import { z } from "zod";
import {
  mongoDbProducts,
  mongoDbProgrammingLanguageIds,
} from "mongodb-rag-core/mongoDbMetadata";

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
};

export type SearchTool = Tool<
  typeof MongoDbSearchToolArgsSchema,
  SearchToolReturnValue
> & {
  execute: (
    args: MongoDbSearchToolArgs,
    options: ToolExecutionOptions
  ) => PromiseLike<SearchToolReturnValue>;
};

export type SearchToolResult = ToolResultUnion<{
  [SEARCH_TOOL_NAME]: SearchTool;
}>;

export function makeSearchTool(findContent: FindContentFunc): SearchTool {
  return tool({
    parameters: MongoDbSearchToolArgsSchema,
    description: "Search MongoDB content",
    // This shows only the URL and text of the result, not the metadata (needed for references) to the model.
    experimental_toToolResultContent(result) {
      return [
        {
          type: "text",
          text: JSON.stringify({
            results: result.results.map(searchResultToLlmContent),
          }),
        },
      ];
    },
    async execute(
      args: MongoDbSearchToolArgs,
      _options: ToolExecutionOptions
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
      };

      return result;
    },
  });
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
