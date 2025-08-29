import { LanguageModel, generateObject } from "mongodb-rag-core/aiSdk";
import { z, ZodType } from "zod";
import { stripIndent } from "common-tags";

export const rewriteSchema = z.object({
  prompt: z.string().optional(),
  response: z.string().optional(),
});

export type Rewrite = z.infer<typeof rewriteSchema>;

export type SuggestRewriteParams = {
  generatorModel: LanguageModel;
  prompt: string;
  response: string;
  guidance: string;
  styleGuide?: string;
};

export const suggestRewrite = async ({
  generatorModel,
  prompt,
  response,
  guidance,
  styleGuide,
}: SuggestRewriteParams): Promise<Rewrite> => {
  if (guidance.length === 0) {
    throw new Error("You must provide guidance to get a suggested rewrite.");
  }
  const { object: rewrite } = await generateObject({
    model: generatorModel,
    schema: rewriteSchema as ZodType<any, Rewrite, any>,
    schemaName: "Rewrite",
    schemaDescription: "A rewrite of the prompt and/or the expected response.",
    prompt: [
      {
        role: "system",
        content: stripIndent`
          You are an expert editor who suggests rewrites.
          You will be given the following:
          - A "prompt" that represents a user's input to a technical assistant/chatbot
          - An "expected response" to the user prompt that ideally represents the ground truth that the assistant/chatbot should produce
          - A brief "guidance" from an expert reviewer that suggests modifications to either/both the prompt or the expected response

          Your job is to suggest a rewrite based on the guidance. Additionally, you may suggest minor changes to use proper grammar, capitalization, and punctuation.
          If you do not have a suggested rewrite for a field then leave the field undefined in your response.

          You may perform one of the following actions:
          - Rewrite the prompt and leave the expected response unchanged (e.g. \`{ "prompt": "<REWRITTEN PROMPT>" }\`)
          - Rewrite the expected response and leave the prompt unchanged (e.g. \`{ "response": "<REWRITTEN RESPONSE>" }\`)
          - Rewrite both the prompt and the expected response (e.g. \`{ "prompt": "<REWRITTEN PROMPT>", "response": "<REWRITTEN RESPONSE>" }\`)

            ${
              styleGuide
                ? stripIndent`
                    Follow this additional style guidance:

                    <StyleGuide>
                    ${styleGuide}
                    </StyleGuide>
                  `
                : ""
            }
          `.trim(),
      },
      // TODO - support few-shot examples
      {
        role: "user",
        content: stripIndent`
          <Prompt>
          ${prompt}
          </Prompt>

          <ExpectedResponse>
          ${response}
          </ExpectedResponse>

          <Guidance>
          ${guidance}
          </Guidance>
        `,
      },
    ],
  });
  if (rewrite.prompt === undefined && rewrite.response === undefined) {
    throw new Error("Failed to generate a rewrite.");
  }
  return rewrite;
};
