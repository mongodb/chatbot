import { generateObject, LanguageModelV1 } from "mongodb-rag-core/aiSdk";
import { makeShortName } from "./assessCases";
import { LlmAsJudgment } from "./Case";

/**
  Given the prompt and expected response pair, use the LLM to assess the quality
  on a variety of metrics and provide recommendations for improvement.
 */
export const generateRating = async ({
  prompt,
  expectedResponse,
  model,
}: {
  prompt: string;
  expectedResponse: string;
  model: LanguageModelV1;
}): Promise<LlmAsJudgment | undefined> => {
  const shortName = makeShortName(prompt);
  console.log(`Rating '${shortName}' with LLM...`);

  const result = await generateObject<LlmAsJudgment>({
    prompt: `
Evaluate the quality of the following prompt-expected answer pair across
multiple dimensions. Return your evaluation as a JSON object with numeric percentage scores
from 1 (poor) to 5 (excellent) up to 3 decimal places. Return only a JSON object (NOT IN MARKDOWN) with the following keys:

- answer_reasonableness: how reasonable it would be to expect an LLM to produce the given response from the given prompt.
- prompt_clarity: how well formulated and clear the prompt is.
- answer_fit: how well the expected answer actually matches the prompt.
- prompt_knowledge_assumption: how much domain-specific knowledge is required to effectively answer the prompt.
- business_impact: the business impact/relevance of the question and answer. Good examples: competitor questions, technical questions. Bad examples: when was MongoDB founded?
- guidance (string, optional): TERSELY and DIRECTLY detail the issue; suggest how to improve the prompt and/or expected response. Only include this if ANY of the above scores <= 2.

Now evaluate this pair, returning only the JSON object:

PROMPT: ${prompt}
---
EXPECTED ANSWER: ${expectedResponse}
`.trim(),
    model,
    schema: LlmAsJudgment,
  });

  return result.object;
};
