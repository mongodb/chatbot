import {
  makeGenerateNaturalLanguageQueryPrompt,
  nlQueryResponseSchema,
} from "./generateNaturalLanguageQueries";
import { Eval, wrapOpenAI } from "mongodb-rag-core/braintrust";
import {
  getOpenAiFunctionResponse,
  LlmOptions,
} from "mongodb-rag-core/executeCode";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { useCaseNodes } from "./sampleData/atlasSearch";
import { z } from "zod";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

const openAiClient = wrapOpenAI(
  new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  })
);

const atlasSearchLabel = "atlas_search";

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
    metadata: {
      databaseName: databaseInfo.name,
      user: user.name,
      useCase: useCase.data.title,
    },
    tags: [atlasSearchLabel],
  };
});

const llmOptions: LlmOptions = {
  model: "gpt-5",
  temperature: 0.4,
  seed: 42,
  reasoning_effort: "medium",
};

async function main() {
  await Eval("generate-atlas-search-natural-language", {
    experimentName: `atlas-search-enhanced-prompt-evaluation-${llmOptions.model}`,
    data: evalData,
    maxConcurrency: 5,
    scores: [],
    async task(input) {
      const promptMessages = makeGenerateNaturalLanguageQueryPrompt({
        ...input,
        queryType: atlasSearchLabel, // Ensure we use Atlas Search prompts
      });
      const { results } = await getOpenAiFunctionResponse({
        messages: promptMessages,
        llmOptions,
        schema: z.object({
          results: nlQueryResponseSchema.schema.array(),
        }),
        functionName: nlQueryResponseSchema.name,
        functionDescription: nlQueryResponseSchema.description,
        openAiClient,
      });
      return { results };
    },
  });
}

main();
