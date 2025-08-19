import {
  makeGenerateNaturalLanguageQueryPrompt,
  nlQueryResponseSchema,
} from "./generateNaturalLanguageQueries";
import { Eval, wrapOpenAI } from "mongodb-rag-core/braintrust";
import { getOpenAiFunctionResponse } from "mongodb-rag-core/executeCode";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { useCaseNodes } from "./sampleData";
import { z } from "zod";
import { NaturalLanguageQuery } from "./nodeTypes";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

const openAiClient = wrapOpenAI(
  new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  })
);

interface Output {
  results: NaturalLanguageQuery[];
}

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
    tags: [databaseInfo.name, user.name, useCase.data.title],
  };
});

const llmOptions = {
  openAiClient,
  model: "gpt-4o",
  temperature: 0.4,
  seed: 42,
};

// Scoring functions to evaluate query quality
const intentDiversityScore = (output: Output) => {
  if (!Array.isArray(output)) return 0;

  const intentPatterns = {
    analysis: /analyze|compare|distribution|pattern|trend|frequency/i,
    discovery: /discover|explore|similar|related|recommendation/i,
    classification: /categorize|classify|group|organize/i,
    quality: /high-quality|comprehensive|authoritative|validate/i,
    gap: /gap|missing|underserved|competitor|advantage/i,
    basic: /^(find|show|search|get|list)/i,
  };

  const intentCounts = Object.keys(intentPatterns).reduce((acc, intent) => {
    acc[intent] = 0;
    return acc;
  }, {} as Record<string, number>);

  output.forEach((query) => {
    const queryText = query.query || "";
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(queryText)) {
        intentCounts[intent]++;
        break; // Count each query only once
      }
    }
  });

  // Calculate diversity score
  const totalQueries = output.length;
  const nonBasicQueries = totalQueries - intentCounts.basic;
  const diversityRatio = nonBasicQueries / totalQueries;

  // Bonus for having multiple different intent types
  const uniqueIntents = Object.entries(intentCounts).filter(
    ([intent, count]) => intent !== "basic" && count > 0
  ).length;

  const diversityBonus = Math.min(uniqueIntents / 5, 1); // Max bonus at 5 different intents

  return Math.min(diversityRatio * 0.7 + diversityBonus * 0.3, 1);
};

const complexityDistributionScore = (output: NaturalLanguageQuery) => {
  if (!Array.isArray(output)) return 0;

  const complexityCounts = {
    simple: 0,
    moderate: 0,
    complex: 0,
  };

  output.forEach((query) => {
    if (query.complexity) {
      complexityCounts[query.complexity as keyof typeof complexityCounts]++;
    }
  });

  const total = output.length;
  const simpleRatio = complexityCounts.simple / total;
  const moderateRatio = complexityCounts.moderate / total;
  const complexRatio = complexityCounts.complex / total;

  // Target: 10-15% simple, 25-30% moderate, 55-65% complex
  const simpleScore =
    simpleRatio >= 0.1 && simpleRatio <= 0.15
      ? 1
      : Math.max(0, 1 - Math.abs(simpleRatio - 0.125) * 8);
  const moderateScore =
    moderateRatio >= 0.25 && moderateRatio <= 0.3
      ? 1
      : Math.max(0, 1 - Math.abs(moderateRatio - 0.275) * 8);
  const complexScore =
    complexRatio >= 0.55 && complexRatio <= 0.65
      ? 1
      : Math.max(0, 1 - Math.abs(complexRatio - 0.6) * 5);

  return (simpleScore + moderateScore + complexScore) / 3;
};

const atlasSearchSpecificityScore = (output: Output) => {
  if (!Array.isArray(output)) return 0;

  // Atlas Search-specific features and operators
  const atlasFeatures = [
    /compound.*(?:must|should|filter|mustNot)/i,
    /boost.*(?:value|relevance|weight)/i,
    /fuzzy.*(?:matching|search|edit.*distance)/i,
    /phrase.*(?:matching|search|exact)/i,
    /autocomplete|type.*ahead/i,
    /proximity.*search|within.*words/i,
    /text.*analyzer|stemming|synonym/i,
    /moreLikeThis|similarity/i,
    /range.*(?:date|numeric|temporal)/i,
    /facet|drill.*down/i,
  ];

  let totalFeatureUse = 0;
  let queriesWithFeatures = 0;

  output.forEach((query) => {
    const queryText = query.query || "";
    let featuresInQuery = 0;

    atlasFeatures.forEach((pattern) => {
      if (pattern.test(queryText)) {
        featuresInQuery++;
        totalFeatureUse++;
      }
    });

    if (featuresInQuery > 0) {
      queriesWithFeatures++;
    }
  });

  const featureUtilizationRate = queriesWithFeatures / output.length;
  const avgFeaturesPerQuery = totalFeatureUse / output.length;

  return Math.min(
    featureUtilizationRate * 0.6 + (avgFeaturesPerQuery / 3) * 0.4,
    1
  );
};

const queryLimitingScore = (output: Output) => {
  if (!Array.isArray(output)) return 0;

  const limitingPatterns = [
    /top\s+\d+/i,
    /\d+\s+(?:most|best|highest|lowest)/i,
    /limit(?:ed)?\s+to\s+\d+/i,
    /first\s+\d+/i,
    /maximum?\s+\d+/i,
  ];

  let queriesWithLimits = 0;

  output.forEach((query) => {
    const queryText = query.query || "";
    const hasLimit = limitingPatterns.some((pattern) =>
      pattern.test(queryText)
    );
    if (hasLimit) {
      queriesWithLimits++;
    }
  });

  return queriesWithLimits / output.length;
};

async function main() {
  console.log("evalData", evalData.length);
  await Eval<(typeof evalData)[number], Output>(
    "generate-atlas-search-natural-language",
    {
      experimentName: "atlas-search-enhanced-prompt-evaluation",
      data: evalData,
      maxConcurrency: 5,
      async task({ input }) {
        const promptMessages = makeGenerateNaturalLanguageQueryPrompt({
          ...input,
          queryType: "atlas_search", // Ensure we use Atlas Search prompts
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
      scores: [
        ({ output }) => {
          return {
            name: "intent_diversity",
            score: intentDiversityScore(output),
          };
        },
        ({ output }) => {
          return {
            name: "complexity_distribution",
            score: complexityDistributionScore(output),
          };
        },
        ({ output }) => {
          return {
            name: "atlas_search_specificity",
            score: atlasSearchSpecificityScore(output),
          };
        },
        ({ output }) => {
          return {
            name: "query_limiting",
            score: queryLimitingScore(output),
          };
        },
      ],
    }
  );
}

main();
