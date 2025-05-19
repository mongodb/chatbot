import { Eval, EvalScorer, wrapOpenAI } from "mongodb-rag-core/braintrust";
import { Factuality } from "autoevals";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { readFileSync } from "fs";
import { z } from "zod";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { stripIndent } from "common-tags";
import path from "path";
import {
  models as coreModels,
  getOpenAiEndpointAndApiKey,
} from "mongodb-rag-core/models";
import PromisePool from "@supercharge/promise-pool";

export const models = coreModels.filter((m) =>
  [
    // "gpt-4.1",
    // "claude-37-sonnet",
    // "llama-3.3-70b",
    "gemini-2.5-pro-preview-03-25",
    // "nova-pro-v1:0",
    // "mistral-large-2",
  ].includes(m.label)
);

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

const evalDataSchema = z.object({
  url: z.string().optional(),
  urlIndex: z.number().optional(),
  difficulty: z.enum(["basic", "intermediate", "advanced"]).optional(),
  type: z.enum(["question", "code_example"]).optional(),
  prompt: z.string(),
});

const evalDataSchemaWithResponse = evalDataSchema.extend({
  response: z.string(),
});

export type EvalData = z.infer<typeof evalDataSchema>;

const evalData = z
  .array(evalDataSchemaWithResponse)
  .parse(
    JSON.parse(
      readFileSync(path.join(__dirname, "atlas-vector-search.json"), "utf-8")
    )
  )
  .map(({ response, ...e }) => ({
    input: e,
    tags: ["atlas-vector-search"],
    expected: response,
    metadata: {
      urlIndex: e.urlIndex,
      url: e.url,
      difficulty: e.difficulty,
      type: e.type,
    },
  }));

const vectorSearchGuide = readFileSync(
  path.join(
    __dirname,
    "../../ingest-mongodb-public/maxxPrompts/atlasVectorSearch.md"
  ),
  "utf-8"
);

function makePrompt(input: {
  evalData: EvalData;
  guide?: string;
}): OpenAI.ChatCompletionMessageParam[] {
  const evalData = {
    type: "question",
    ...input.evalData,
  };
  return [
    {
      role: "system",
      content: stripIndent`
        You are a helpful assistant that helps users build applications.

        ${
          input.guide
            ? stripIndent`
              The following is a guide with information that may help you answer the user's question:

              ${input.guide}
            `
            : ""
        }
      `,
    },
    {
      role: "user",
      content: stripIndent`
        Please ${
          evalData.type === "question"
            ? "answer the following user question"
            : "give an example of the following"
        }:

        ${evalData.prompt}
      `,
    },
  ];
}

const llmOptions = {
  model: "gpt-4o",
  temperature: 0.3,
  seed: 42,
};

async function chat(args: {
  openAiClient: OpenAI;
  messages: OpenAI.ChatCompletionMessageParam[];
  llmOptions?: Partial<LlmOptions>;
}) {
  const options = {
    ...llmOptions,
    ...args.llmOptions,
  };
  const res = await args.openAiClient.chat.completions.create({
    messages: args.messages,
    ...options,
  });
  return res.choices[0].message.content;
}

export function makeReferenceAlignmentScorer(args: {
  openAiApiKey: string;
  openAiBaseUrl: string;
  model: string;
  name_postfix?: string;
}): EvalScorer<EvalData, string, string> {
  return async function ({ input, output, expected }) {
    const name = `ReferenceAlignment${
      args.name_postfix ? `_${args.name_postfix}` : ""
    }`;

    const factuality = await Factuality({
      input: input.prompt,
      output,
      expected,
      openAiApiKey: args.openAiApiKey,
      openAiBaseUrl: args.openAiBaseUrl,
      model: args.model,
    });
    return {
      ...factuality,
      score: remapFactualityScore(factuality.score),
      name,
    };
  };
}

function remapFactualityScore(score: number | null) {
  if (score === null) {
    return null;
  }
  switch (score) {
    case 0.4:
      return 0.25;
    case 0.6:
      return 0.75;
    default:
      return score;
  }
}

const referenceAlignment = makeReferenceAlignmentScorer({
  openAiApiKey: BRAINTRUST_API_KEY,
  openAiBaseUrl: BRAINTRUST_ENDPOINT,
  model: "gpt-4.1",
});

function makeExperimentName(args: {
  guide: boolean;
  product: string;
  model: string;
}) {
  return `${args.guide ? "guide" : "raw"}-${args.product}?model="${
    args.model
  }"`;
}

const BRAINTRUST_PROJECT_NAME = "distilled-guides";

async function main() {
  console.log("evalData", evalData.length);

  await PromisePool.for(models)
    .withConcurrency(2)
    .handleError((error, model) => {
      console.error(`Error for model ${model.label}:`, error);
    })
    .process(async (model) => {
      const { apiKey, baseURL } = await getOpenAiEndpointAndApiKey(model);
      const openAiClient = wrapOpenAI(
        new OpenAI({
          apiKey,
          baseURL,
        })
      );
      await Eval(BRAINTRUST_PROJECT_NAME, {
        experimentName: makeExperimentName({
          guide: false,
          product: "atlas-vector-search",
          model: model.label,
        }),
        data: evalData,
        maxConcurrency: model.maxConcurrency,
        async task(input) {
          const aiResponse = await chat({
            messages: makePrompt({ evalData: input }),
            openAiClient,
            llmOptions: {
              model: model.deployment,
            },
          });
          if (aiResponse === null) {
            throw new Error("AI response is null");
          }
          return aiResponse;
        },
        scores: [referenceAlignment],
      });

      await Eval(BRAINTRUST_PROJECT_NAME, {
        experimentName: makeExperimentName({
          guide: true,
          product: "atlas-vector-search",
          model: model.label,
        }),
        data: evalData,
        maxConcurrency: model.maxConcurrency,
        async task(input) {
          const aiResponse = await chat({
            messages: makePrompt({ evalData: input, guide: vectorSearchGuide }),
            openAiClient,
            llmOptions: {
              model: model.deployment,
            },
          });
          if (aiResponse === null) {
            throw new Error("AI response is null");
          }
          return aiResponse;
        },
        scores: [referenceAlignment],
      });
    });
}

main();
