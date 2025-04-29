import { SearchTool, SearchToolResult } from "mongodb-chatbot-server";
import { FindContentFunc, updateFrontMatter } from "mongodb-rag-core";
import { tool } from "mongodb-rag-core/aiSdk";
import { z } from "zod";
import {
  mongoDbProducts,
  mongoDbProgrammingLanguageIds,
} from "./mongoDbMetadata";

export function makeSearchTool(findContent: FindContentFunc): SearchTool {
  return tool({
    parameters: z.object({
      productName: z
        .enum(
          mongoDbProducts.map((product) => product.id) as [string, ...string[]]
        )
        .nullable()
        .optional()
        .describe(
          "Most relevant MongoDB product for query. Leave null if unknown"
        ),
      programmingLanguage: z
        .enum(mongoDbProgrammingLanguageIds)
        .nullable()
        .optional()
        .describe(
          "Most relevant programming language for query. Leave null if unknown"
        ),
      query: z.string().describe("Search query"),
    }),
    description: "Search MongoDB content",
    async execute({ query, productName, programmingLanguage }) {
      // Ensure we match the SearchToolResult type exactly
      const nonNullMetadata: Record<string, string> = {};
      if (productName) {
        nonNullMetadata.productName = productName;
      }
      if (programmingLanguage) {
        nonNullMetadata.programmingLanguage = programmingLanguage;
      }

      const queryWithMetadata = updateFrontMatter(query, nonNullMetadata);
      const content = await findContent({ query: queryWithMetadata });

      // Ensure the returned structure matches SearchToolResult
      const result: SearchToolResult = {
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
