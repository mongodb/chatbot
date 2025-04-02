import { generateMongoshCodeAgentic } from "./generateMongoshCodeAgentic";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { createOpenAI } from "@ai-sdk/openai";
import { TEXT_TO_DRIVER_ENV_VARS } from "../../envVars";
import { makeSampleLlmOptions } from "../../test/makeSampleLlmOptions";
import { annotatedDbSchemas } from "./annotatedDbSchemas";

// Skipping LLM call tests
describe.skip("generateMqlCode", () => {
  jest.setTimeout(300000); // Increase timeout for OpenAI API calls

  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
    MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  } = assertEnvVars({
    ...TEXT_TO_DRIVER_ENV_VARS,
    ...BRAINTRUST_ENV_VARS,
  });
  const openai = createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  });
  const llmOptions = makeSampleLlmOptions();
  const dbName = "sample_mflix";

  it("should generate MQL code for a NL query", async () => {
    const nlQuery = "Count all movies with a rating of 5";
    const mqlCode = await generateMongoshCodeAgentic({
      databaseName: dbName,
      uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
      databaseInfo: annotatedDbSchemas[dbName],
      nlQuery: {
        nl_query: nlQuery,
        dataset_name: dbName,
      },
      openai,
      llmOptions,
    });
    console.log("GeneratedMqlCode", mqlCode.execution.result);
  });
});
