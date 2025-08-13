import { generateObject, LanguageModel } from "mongodb-rag-core/aiSdk";
import { extracZodSchemaDescriptions } from "./utils";
import z from "zod";
import { stripIndent } from "common-tags";
import YAML from "yaml";

const ratingSchema = z
  .number()
  .min(1)
  .max(5)
  .describe("A score from 1 (poor) to 5 (excellent).");

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
      score: ratingSchema,
      rationale: makeRationaleSchema("answer fit"),
    })
    .describe(
      stripIndent`
        How well the expected answer actually matches the prompt.
        A high score indicates that the answer is directly relevant to the prompt and provides a clear and concise response.
        A low score indicates that the answer is not directly relevant to the prompt or contains extraneous information.
      `
    ),
  answer_reasonableness: z
    .object({
      score: ratingSchema,
      rationale: makeRationaleSchema("answer reasonableness"),
    })
    .describe(
      stripIndent`
        How reasonable it would be to expect an LLM to produce the given response from the given prompt.
        A high score indicates that the answer is reasonable and likely to be produced by an LLM.
        A low score indicates that the answer is not reasonable and likely to be produced by an LLM.
      `
    ),
  business_impact: z
    .object({
      score: ratingSchema,
      rationale: makeRationaleSchema("business impact"),
    })
    .describe(
      stripIndent`
        The business impact/relevance of the question and answer.
        High impact questions are likely to generate new revenue or prevent customer churn.
        Examples of high impact topics: market positioning, technical support, product roadmap, etc.
        Low impact questions are likely to be easily answered by a simple search and/or have little impact on the business.
        Examples of low impact prompts: When was MongoDB founded?, What is the latest version of MongoDB?, etc.
      `
    ),
  prompt_clarity: z
    .object({
      score: ratingSchema,
      rationale: makeRationaleSchema("prompt clarity"),
    })
    .describe(
      stripIndent`
        How well-formulated and clear the prompt is.
        A high score indicates that the prompt is clear and focused on a specific topic.
        A low score indicates that the prompt is unclear or too broad.
      `
    ),
  prompt_knowledge_assumption: z
    .object({
      score: ratingSchema,
      rationale: makeRationaleSchema("prompt knowledge assumption"),
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
        Only include this if ANY of the above scores <= 2.
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
      prompt: stripIndent`
        Your task is to evaluate the quality of a technical chatbot prompt/response turn.
        You will be given a user prompt and an expected answer for the prompt.
        You will evaluate the quality of the prompt/response pair across multiple dimensions.
        For each dimension, you will assign a score from 1 (poor) to 5 (excellent) as well as a rationale for your score.

        Here are the dimensions you will evaluate:
        ${YAML.stringify(
          extracZodSchemaDescriptions(promptResponseRatingSchema),
          {
            indent: 4,
          }
        )}

        ${
          styleGuide
            ? stripIndent`
                Here is a style guide for the prompt/response pair:
                <StyleGuide>
                ${styleGuide}
                </StyleGuide>
              `
            : ""
        }

        Now evaluate this prompt/expected response pair:

        <Prompt>
        ${prompt}
        </Prompt>

        <ExpectedResponse>
        ${response}
        </ExpectedResponse>
      `.trim(),
      temperature: 0.1,
      model,
      schema: promptResponseRatingSchema,
      schemaName,
      schemaDescription:
        "Ratings, rationale, and guidance for a given prompt response pair.",
    });

    return result.object;
  };
}
