import { strict as assert } from "assert";
import { normalizedSquareMagnitudeDifference } from "./squareMagnitude";
import { calculateEmbeddings } from "./calculateEmbeddings";
import { SimpleTextGenerator } from "./SimpleTextGenerator";
import { Embedder } from "mongodb-rag-core";
import {
  LlmAsJudgment,
  PromptAndEmbeddings,
  Relevance,
  RelevanceMetrics,
  ScoredPromptAndEmbeddings,
} from "./Case";
import { cosineSimilarity } from "mongodb-rag-core/aiSdk";

/**
  Given the expected answer, generate a number of possible prompts that could
  elicit that expected answer.
 */
export const generatePromptsFromExpectedAnswer = async ({
  expected,
  embedders,
  generate,
  howMany,
}: {
  expected: string;
  embedders: Embedder[];
  generate: SimpleTextGenerator;
  howMany: number;
}): Promise<PromptAndEmbeddings[]> => {
  const variants = await generate({
    prompt: `Given the following "expected answer", formulate a question that is likely to elicit the expected answer.
Don't necessarily use proper grammar or punctuation; write like a user of a chatbot, search engine, or LLM would.
Just return the generated question.

Expected answer:\n\n${expected}`,
    n: howMany,
    temperature: 0.5,
  });

  return await Promise.all(
    variants.map(async (text) => {
      return {
        prompt: text,
        embeddings: await calculateEmbeddings({ embedders, text }),
      };
    })
  );
};

export const scoreVariants = ({
  original,
  variants,
}: {
  original: PromptAndEmbeddings;
  variants: PromptAndEmbeddings[];
}): ScoredPromptAndEmbeddings[] => {
  return variants.map(
    ({ embeddings: variantEmbeddings, prompt }): ScoredPromptAndEmbeddings => {
      const relevance = Object.fromEntries(
        Object.entries(original.embeddings).map(
          ([model, originalEmbedding]): [string, RelevanceMetrics] => {
            assert(
              variantEmbeddings[model] !== undefined,
              `No embedding for model ${model}!`
            );
            return [
              model,
              {
                cos_similarity: cosineSimilarity(
                  originalEmbedding,
                  variantEmbeddings[model]
                ),
                norm_sq_mag_diff: normalizedSquareMagnitudeDifference(
                  originalEmbedding,
                  variantEmbeddings[model]
                ),
              },
            ];
          }
        )
      );
      return {
        embeddings: variantEmbeddings,
        prompt,
        relevance,
      };
    }
  );
};

export const assessRelevance = async ({
  prompt,
  embedders,
  expected,
  generate,
}: {
  prompt: string;
  expected: string;
  embedders: Embedder[];
  generate: SimpleTextGenerator;
}): Promise<Relevance> => {
  const shortName = makeShortName(prompt);
  console.log(`Calculating embeddings for '${shortName}'...`);

  const promptEmbeddings = await calculateEmbeddings({
    text: prompt,
    embedders,
  });

  console.log(`Generating variants for '${shortName}'...`);
  const variants = await generatePromptsFromExpectedAnswer({
    embedders,
    expected,
    generate,
    howMany: 3,
  });

  const variantCount = Object.values(variants).length;
  if (variantCount === 0) {
    throw new Error(`Unexpectedly without variants for ${shortName}!`);
  }

  const scoredVariants = scoreVariants({
    original: { prompt, embeddings: promptEmbeddings },
    variants,
  });
  assert(variantCount === Object.values(scoredVariants).length);

  console.log(
    `- Expected: "${expected}"
- Original: "${prompt}"
- Generated variants:
${scoredVariants.map(({ prompt }) => `  - "${prompt}"`).join("\n")}`
  );

  const summedMetrics = scoredVariants.reduce(
    (outer, { relevance }): RelevanceMetrics => {
      const relevanceValues = Object.values(relevance);
      const modelCount = relevanceValues.length;
      assert(modelCount > 0);
      // Sum metrics across models
      const crossModel = relevanceValues.reduce(
        (acc, { cos_similarity, norm_sq_mag_diff }) => ({
          cos_similarity: acc.cos_similarity + cos_similarity,
          norm_sq_mag_diff: acc.norm_sq_mag_diff + norm_sq_mag_diff,
        }),
        { cos_similarity: 0, norm_sq_mag_diff: 0 }
      );

      // Accumulate averages across models
      return {
        cos_similarity:
          outer.cos_similarity + crossModel.cos_similarity / modelCount,
        norm_sq_mag_diff:
          outer.norm_sq_mag_diff + crossModel.norm_sq_mag_diff / modelCount,
      };
    },
    { cos_similarity: 0, norm_sq_mag_diff: 0 }
  );
  const averages: RelevanceMetrics = {
    cos_similarity: summedMetrics.cos_similarity / variantCount,
    norm_sq_mag_diff: summedMetrics.norm_sq_mag_diff / variantCount,
  };

  console.log(`Average score: ${JSON.stringify(averages)}`);
  return {
    prompt_embeddings: promptEmbeddings,
    generated_prompts: scoredVariants,
    averages,
  };
};

export const rateWithLlm = async ({
  prompt,
  expected,
  generate,
}: {
  prompt: string;
  expected: string;
  generate: SimpleTextGenerator;
}): Promise<LlmAsJudgment | undefined> => {
  const shortName = makeShortName(prompt);
  console.log(`Rating '${shortName}' with LLM...`);

  const [response] = await generate({
    prompt: `
Evaluate the quality of the following prompt-expected answer pair across
multiple dimensions. Return your evaluation as a JSON object with numeric percentage scores
from 0 (poor) to 1 (excellent) up to 3 decimal places. Return only a JSON object (NOT IN MARKDOWN) with the following keys:

- reasonableness: how reasonable it would be to expect an LLM to produce the given response from the given prompt.
- clarity: how well formulated and clear the prompt is.
- fit: how well the expected answer actually matches the prompt.
- assumption: how much domain-specific knowledge is required to effectively answer the prompt.
- impact: the business impact/relevance of the question and answer. Good examples: competitor questions, technical questions. Bad exaples: when was MongoDB founded?
- guidance (string, optional): TERSELY and DIRECTLY detail the issue; suggest how to improve. Only include this if the above scores are low.

Now evaluate this pair, returning only the JSON object:

PROMPT: ${prompt}
---
EXPECTED ANSWER: ${expected}
`,
    n: 1,
    temperature: 0,
  });

  try {
    const judgment = LlmAsJudgment.parse(JSON.parse(response));
    console.log(`Judgment of '${shortName}':
${JSON.stringify(judgment, undefined, 2)}`);
    return judgment;
  } catch (e) {
    console.error(
      `Failed to parse response "${response}" into LlmAsJudgment: ${
        (e as Error)?.message
      }`
    );
    return undefined;
  }
};

export const makeShortName = (prompt: string, ellipsizeAtLength = 64) => {
  assert(ellipsizeAtLength > 0);
  return prompt.length > ellipsizeAtLength
    ? prompt.slice(0, ellipsizeAtLength - 3) + "..."
    : prompt;
};
