import { Eval, EvalScorer, wrapOpenAI } from "mongodb-rag-core/braintrust";
import { Factuality } from "autoevals";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { readFileSync } from "fs";
import { z } from "zod";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { stripIndent } from "common-tags";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

const openAiClient = wrapOpenAI(
  new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  })
);

const evalDataSchema = z.object({
  url: z.string(),
  urlIndex: z.number(),
  difficulty: z.enum(["basic", "intermediate", "advanced"]),
  type: z.enum(["question", "code_example"]),
  prompt: z.string(),
});

const evalDataSchemaWithResponse = evalDataSchema.extend({
  response: z.string(),
});

export type EvalData = z.infer<typeof evalDataSchema>;

const evalData = z
  .array(evalDataSchemaWithResponse)
  .parse(JSON.parse(readFileSync("atlasVectorSearchEvals.json", "utf-8")))
  .map(({ response, ...e }) => ({
    input: e,
    tags: ["atlas-vector-search"],
    expected: response,
  }));

function makePrompt(input: {
  evalData: EvalData;
  guide?: string;
}): OpenAI.ChatCompletionMessageParam[] {
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
          input.evalData.type === "question"
            ? "answer the following user question"
            : "give an example of the following"
        }:

        ${input.evalData.prompt}
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
      name,
      metadata: {
        urlIndex: input.urlIndex,
        url: input.url,
        difficulty: input.difficulty,
        type: input.type,
      },
    };
  };
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
  console.log("__dirname", __dirname);
  // readFileSync(
  //   "../../../ingest-mongodb-public/maxxPrompts/atlasVectorSearch.md"
  // );
  // await Eval("distilled-guides", {
  //   experimentName: "no-guide",
  //   data: evalData,
  //   maxConcurrency: 5,
  //   async task(input) {
  //     const aiResponse = await chat(makePrompt({ evalData: input }));
  //     if (aiResponse === null) {
  //       throw new Error("AI response is null");
  //     }
  //     return aiResponse;
  //   },
  //   scores: [referenceAlignment],
  // });

  // await Eval("distilled-guides", {
  //   experimentName: "distilled-atlas-vector-search",
  //   data: evalData,
  //   maxConcurrency: 5,
  //   async task(input) {
  //     const aiResponse = await chat(makePrompt({ evalData: input }));
  //     if (aiResponse === null) {
  //       throw new Error("AI response is null");
  //     }
  //     return aiResponse;
  //   },
  //   scores: [referenceAlignment],
  // });
}

main();
