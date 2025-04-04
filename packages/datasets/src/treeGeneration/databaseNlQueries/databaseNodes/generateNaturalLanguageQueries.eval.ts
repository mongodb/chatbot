import {
  makeGenerateNaturalLanguageQueryPrompt,
  nlQueryResponseSchema,
} from "./generateNaturalLanguageQueries";
import { Eval, wrapOpenAI } from "mongodb-rag-core/braintrust";
import { getOpenAiFunctionResponse } from "mongodb-rag-core/executeCode";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { useCaseNodes } from "./sampleData";
import { z } from "zod";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

const openAiClient = wrapOpenAI(
  new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  })
);

const evalData = useCaseNodes.map((useCase) => {
  const databaseInfo = useCase.parent.parent.data;
  const user = useCase.parent.data;
  return {
    input: {
      databaseInfo,
      useCase: useCase.data,
      user,
      numChildren: 8,
    },
    tags: [databaseInfo.name, user.name, useCase.data.title],
  };
});

const llmOptions = {
  openAiClient,
  model: "gpt-4o",
  temperature: 0.4,
  seed: 42,
};

async function main() {
  console.log("evalData", evalData.length);
  await Eval("generate-natural-language-to-mongodb", {
    experimentName: "generate-natural-language-queries",
    data: evalData,
    maxConcurrency: 5,
    async task(input) {
      const promptMessages = makeGenerateNaturalLanguageQueryPrompt(input);
      const { results } = await getOpenAiFunctionResponse({
        messages: promptMessages,
        llmOptions,
        schema: z.object({
          results: nlQueryResponseSchema.schema.array(),
        }),
        functionName: nlQueryResponseSchema.name,
        functionDescription: nlQueryResponseSchema.description,
      });
      return results;
    },
    scores: [],
  });
}

main();
