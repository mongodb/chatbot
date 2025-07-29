import "dotenv/config";
import { makeGenerateMongoshCodeToolCallTask } from "./generateMongoshCodeToolCall";
import { annotatedDbSchemas } from "./annotatedDbSchemas";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { getOpenAiEndpointAndApiKey, models } from "mongodb-rag-core/models";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import { assertEnvVars } from "mongodb-rag-core";

describe.skip("makeGenerateMongoshCodeToolCallTask", () => {
  const llmOptions = { model: "gpt-4o-mini" };

  it("returns execution and code when OpenAI returns valid tool call", async () => {
    const { MONGODB_TEXT_TO_DRIVER_CONNECTION_URI } = assertEnvVars({
      MONGODB_TEXT_TO_DRIVER_CONNECTION_URI: "",
    });

    const openai = createOpenAI({
      ...(await getOpenAiEndpointAndApiKey(
        models.find((m) => m.label === llmOptions.model)!
      )),
    });
    const task = makeGenerateMongoshCodeToolCallTask({
      uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
      databaseInfos: annotatedDbSchemas,
      openai: wrapLanguageModel({
        model: openai.chat(llmOptions.model),
        middleware: [BraintrustMiddleware({ debug: true })],
      }),
      llmOptions,
      schemaStrategy: "annotated",
    });
    const result = await task(
      {
        databaseName: "sample_mflix",
        nlQuery: "Find all users",
      },
      {} as any
    );
    expect(result.execution.result).toBeTruthy();
    expect(result.execution.error).toBe(null);
    expect(result.execution.executionTimeMs).toBeGreaterThan(0);
    expect(result.generatedCode).toBeTruthy();
    expect(result.generatedCode).toBe(expect.any(String));
  });
});
