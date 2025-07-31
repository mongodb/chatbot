import { generateObject, LanguageModel } from "mongodb-rag-core/aiSdk";
import { makeShortName } from "./assessCases";
import z from "zod";

const Rating = z.number().min(1).max(5);
const Rationale = (name: string) =>
  z
    .string()
    .optional()
    .describe(
      `A terse and direct chain of thought or rationale for why you gave the ${name} score.`
    );
export const PromptResponseRating = z.object({
  answer_fit: Rating.describe(
    "How well the expected answer actually matches the prompt."
  ),
  answer_reasonableness: Rating.describe(
    "How reasonable it would be to expect an LLM to produce the given response from the given prompt."
  ),
  business_impact: Rating.describe(
    "The business impact/relevance of the question and answer. Good examples: competitor questions, technical questions. Bad examples: when was MongoDB founded?"
  ), // TODO: Clarify this - it is intended to evaluate how useful the prompt actually is - something you can just google? Or something people might actually need help with?
  prompt_clarity: Rating.describe(
    "How well-formulated and clear the prompt is."
  ),
  prompt_knowledge_assumption: Rating.describe(
    "How much domain-specific knowledge might be required to effectively answer the prompt."
  ),

  guidance: z
    .string()
    .optional()
    .describe(
      "TERSELY and DIRECTLY detail the issue; suggest how to improve the prompt and/or expected response. Only include this if ANY of the above scores <= 2"
    ),

  answer_fit_rationale: Rationale("answer fit"),
  answer_reasonableness_rationale: Rationale("answer reasonableness"),
  business_impact_rationale: Rationale("business impact"),
  prompt_clarity_rationale: Rationale("prompt clarity"),
  prompt_knowledge_assumption_rationale: Rationale(
    "prompt knowledge assumption"
  ),
});

export type PromptResponseRating = z.infer<typeof PromptResponseRating>;

const schemaName = "prompt_response_rating";

/**
  Creates a function that, given the prompt and expected response pair, uses the
  LLM to assess the quality on a variety of metrics and provide recommendations
  for improvement.
 */
export const makeGenerateRating = ({ model }: { model: LanguageModel }) => {
  return async ({
    prompt,
    expectedResponse,
  }: {
    prompt: string;
    expectedResponse: string;
  }): Promise<PromptResponseRating> => {
    const shortName = makeShortName(prompt);
    console.log(`Rating '${shortName}' with LLM...`);

    const result = await generateObject({
      // TODO: TOMAYBEDO: Add more context to 1-5, add more context on different scores...
      // - Output chain of thought - helpful for debugging
      prompt: `
Evaluate the quality of the following prompt-expected answer pair across
multiple dimensions. Return your evaluation as a JSON object with numeric scores
from 1 (poor) to 5 (excellent).

Now evaluate this promt/expected answer pair:

<PROMPT>
${prompt}
</PROMPT>
<EXPECTED-ANSWER>
${expectedResponse}
</EXPECTED-ANSWER>

Format the response in a '${schemaName}' JSON object.
`.trim(),
      model,
      schema: PromptResponseRating,
      schemaName,
      schemaDescription: "Ratings for prompt response pair.",
    });

    return result.object;
  };
};

export type GenerateRating = ReturnType<typeof makeGenerateRating>;
