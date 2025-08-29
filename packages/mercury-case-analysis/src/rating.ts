import { generateObject, LanguageModel } from "mongodb-rag-core/aiSdk";
import { extractZodSchemaDescriptions } from "./utils";
import z from "zod";
import { stripIndent } from "common-tags";
import YAML from "yaml";
import { ZodType } from "zod/v4";

const ratingSchema = z
  .int()
  .min(1)
  .max(5)
  .describe(
    "A Likert scale rating from 1 (Strongly Disagree) to 5 (Strongly Agree)."
  );

const makeRationaleSchema = (name: string) =>
  z
    .string()
    .optional()
    .describe(
      `A terse and direct chain of thought or rationale for why you gave the ${name} score.`
    );

export const promptResponseRatingSchema = z.object({
  answer_fit: z
    .object({
      rationale: makeRationaleSchema("answer fit"),
      score: ratingSchema,
    })
    .describe(
      stripIndent`
        The expected answer is directly relevant to the prompt and provides a clear and concise response without extraneous information.
      `
    ),
  answer_reasonableness: z
    .object({
      rationale: makeRationaleSchema("answer reasonableness"),
      score: ratingSchema,
    })
    .describe(
      stripIndent`
        One could reasonably expect an LLM to produce the given response from the given prompt.
      `
    ),
  business_impact: z
    .object({
      rationale: makeRationaleSchema("business impact"),
      score: ratingSchema,
    })
    .describe(
      stripIndent`
        The prompt and response could have significant business impact (e.g. generate new revenue or prevent customer churn) if asked by a user.
      `
    ),
  prompt_clarity: z
    .object({
      rationale: makeRationaleSchema("prompt clarity"),
      score: ratingSchema,
    })
    .describe(
      stripIndent`
        The prompt is well-formulated, clear, and focused on a specific topic.
      `
    ),
  prompt_knowledge_assumption: z
    .object({
      rationale: makeRationaleSchema("prompt knowledge assumption"),
      score: ratingSchema,
    })
    .describe(
      stripIndent`
        How much domain-specific knowledge might be required to effectively answer the prompt.
        A high score indicates that the prompt is deeply technical or obscure.
        A low score indicates that the prompt is relatively simple and straightforward.
      `
    ),
  guidance: z
    .string()
    .optional()
    .describe(
      stripIndent`
        A terse and direct suggestion for how to improve the prompt and/or expected response.
        Only include this if ANY of the above scores <= 3.
      `
    ),
});

export type PromptResponseRating = z.infer<typeof promptResponseRatingSchema>;

const schemaName = "prompt_response_rating";

export type GenerateRating = (args: {
  prompt: string;
  response: string;
}) => Promise<PromptResponseRating>;

/**
  Creates a function that, given the prompt and expected response pair, uses the
  LLM to assess the quality on a variety of metrics and provide recommendations
  for improvement.
 */
export function makeGenerateRating({
  model,
  styleGuide,
}: {
  model: LanguageModel;
  styleGuide?: string;
}): GenerateRating {
  return async ({ prompt, response }): Promise<PromptResponseRating> => {
    const result = await generateObject({
      prompt: [
        {
          role: "system",
          content: stripIndent`
            Your task is to evaluate the quality of a technical chatbot prompt/response turn.
            You will be given a user prompt and an expected answer for the prompt.
            You will evaluate the quality of the prompt/response pair across multiple dimensions.
            For each dimension, you will evaluate the prompt/response pair and assign a Likert score from the following options:

            - 1 (Strongly Disagree)
            - 2 (Disagree)
            - 3 (Neutral)
            - 4 (Agree)
            - 5 (Strongly Agree)

            Think through the rationale for each score first. Then based on the rationale, assign the score.

            Here are the dimensions you will evaluate:
            ${YAML.stringify(
              extractZodSchemaDescriptions(promptResponseRatingSchema),
              {
                indent: 4,
              }
            )}

            ${
              styleGuide
                ? stripIndent`
                    Additional guidance for the prompt/response pair:

                    ${styleGuide}
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
          `,
        },
      ],
      temperature: 0,
      model,
      schema: promptResponseRatingSchema as ZodType<
        any,
        PromptResponseRating,
        any
      >,
      schemaName,
      schemaDescription:
        "Ratings, rationale, and guidance for a given prompt response pair.",
    });

    return result.object;
  };
}
