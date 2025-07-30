import { makeGenerateMongoshCodeAgenticTask } from "./generateMongoshCodeAgentic";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { createOpenAI } from "mongodb-rag-core/aiSdk";
import { TEXT_TO_DRIVER_ENV_VARS } from "../../envVars";
import { makeSampleLlmOptions } from "../../test/makeSampleLlmOptions";
import { annotatedDbSchemas } from "./annotatedDbSchemas";

describe.skip("generateMongoshCodeAgentic", () => {
  it("should generate MQL code for a NL query", async () => {
    const llmOptions = makeSampleLlmOptions();
    const dbName = "sample_mflix";
    // Skip tests if environment variables are not set
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
    }).chat(llmOptions.model);
    const generateMongoshCodeAgentic = makeGenerateMongoshCodeAgenticTask({
      llmOptions,
      databaseInfos: annotatedDbSchemas,
      openai,
      uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
    });
    const nlQuery = "Count all movies with a rating of 5";

    // Create a mock for the second parameter that satisfies the EvalHooks interface
    const mockHooks = jest.fn() as unknown as Parameters<
      typeof generateMongoshCodeAgentic
    >[1];

    const mqlCode = await generateMongoshCodeAgentic(
      {
        nlQuery: nlQuery,
        databaseName: dbName,
      },
      mockHooks
    );
    console.log("GeneratedMqlCode", mqlCode.execution.result);
  });
});
