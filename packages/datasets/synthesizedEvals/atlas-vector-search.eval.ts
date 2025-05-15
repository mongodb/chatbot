import { Eval, EvalScorer, wrapOpenAI } from "mongodb-rag-core/braintrust";
import { Factuality } from "autoevals";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { readFileSync } from "fs";
import { z } from "zod";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { stripIndent } from "common-tags";
import path from "path";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

const openAiClient = wrapOpenAI(
  new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  })
);

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

async function chat(messages: OpenAI.ChatCompletionMessageParam[]) {
  const res = await openAiClient.chat.completions.create({
    messages,
    ...llmOptions,
  });
  return res.choices[0].message.content;
}

export function makeReferenceAlignmentScorer(args: {
  llmOptions: LlmOptions;
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
      // Note: need to do the funky casting here
      // b/c of different `OpenAI` client typing
      // that is not relevant here.
      client: args.llmOptions.openAiClient as unknown as Parameters<
        typeof Factuality
      >[0]["client"],
      model: args.llmOptions.model,
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
    score = 0;
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
  llmOptions: {
    ...llmOptions,
    model: "gpt-4o-mini",
    openAiClient,
  },
});

async function main() {
  console.log("evalData", evalData.length);
  await Eval("distilled-guides", {
    experimentName: "no-guide-atlas-vector-search",
    data: evalData,
    maxConcurrency: 10,
    async task(input) {
      const aiResponse = await chat(makePrompt({ evalData: input }));
      if (aiResponse === null) {
        throw new Error("AI response is null");
      }
      return aiResponse;
    },
    scores: [referenceAlignment],
  });

  await Eval("distilled-guides", {
    experimentName: "distilled-atlas-vector-search",
    data: evalData,
    maxConcurrency: 10,
    async task(input) {
      const aiResponse = await chat(
        makePrompt({ evalData: input, guide: vectorSearchGuide })
      );
      if (aiResponse === null) {
        throw new Error("AI response is null");
      }
      return aiResponse;
    },
    scores: [referenceAlignment],
  });
}

main();
