import { SearchTool, SearchToolReturnValue } from "mongodb-chatbot-server";
import { FindContentFunc, updateFrontMatter } from "mongodb-rag-core";
import { tool, ToolExecutionOptions } from "mongodb-rag-core/aiSdk";
import { z } from "zod";
import {
  mongoDbProducts,
  mongoDbProgrammingLanguageIds,
} from "./mongoDbMetadata";

const SearchToolArgsSchema = z.object({
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

export type SearchToolArgs = z.infer<typeof SearchToolArgsSchema>;

export function makeSearchTool(
  findContent: FindContentFunc
): SearchTool<typeof SearchToolArgsSchema> {
  return tool({
    parameters: SearchToolArgsSchema,
    description: "Search MongoDB content",
    async execute(
      args: SearchToolArgs,
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
        content: content.content.map((item) => ({
          url: item.url,
          text: item.text,
          metadata: item.metadata,
        })),
      };

      return result;
    },
  });
}
