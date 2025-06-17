import { EmbeddedContentStore } from "mongodb-rag-core";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { Tool, tool, ToolExecutionOptions } from "mongodb-rag-core/aiSdk";
import { z } from "zod";

export const MongoDbFetchPageToolArgsSchema = z.object({
  pageUrl: z.string().describe("URL of page to fetch"),
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

export function makeFetchPageTool(
  embeddedContentStore: EmbeddedContentStore
): FetchPageTool {
  return tool({
    parameters: MongoDbFetchPageToolArgsSchema,
    description: "Fetch all content for a specific URL",
    execute: wrapTraced(
      async function (
        args: MongoDbFetchPageToolArgs,
        _options: ToolExecutionOptions
      ): Promise<string> {
        // do fetch...
        return "";
      },
      {
        name: "fetchPageTool",
      }
    ),
  });
}
