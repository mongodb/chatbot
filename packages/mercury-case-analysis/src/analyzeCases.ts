import { makeSimpleTextGenerator } from "./generateText";
import { makeGenerateRating, PromptResponseRating } from "./rating";
import { assessRelevance, Relevance } from "./relevance";
import { EmbeddingModel, LanguageModel } from "mongodb-rag-core/aiSdk";
import { PromisePool } from "@supercharge/promise-pool";
import { makeShortName } from "./utils";

export type MakeAnalyzeCaseParams = {
  embeddingModels: EmbeddingModel<string>[];
  generatorModel: LanguageModel;
  judgementModel: LanguageModel;
  ratingStyleGuide?: string;
  shouldLog?: boolean;
};

export type CaseAnalysis = {
  relevance: Relevance;
  quality: PromptResponseRating;
};

export type AnalyzeCase = (args: {
  prompt: string;
  response: string;
}) => Promise<CaseAnalysis>;

export type CaseAnalysisInput = Parameters<AnalyzeCase>[0];

export function makeAnalyzeCase({
  judgementModel,
  ratingStyleGuide,
  generatorModel,
  embeddingModels,
  shouldLog = true,
}: MakeAnalyzeCaseParams): AnalyzeCase {
  const generateRating = makeGenerateRating({
    model: judgementModel,
    styleGuide: ratingStyleGuide,
  });
  const generateText = makeSimpleTextGenerator({ model: generatorModel });

  return async ({ prompt, response }) => {
    if (shouldLog) {
      console.log(`Analyzing case: '${makeShortName(prompt)}'...`);
    }
    const [relevance, quality] = await Promise.all([
      assessRelevance({
        prompt,
        response,
        generateText,
        embeddingModels,
      }),
      generateRating({
        prompt,
        response,
      }),
    ]);

    return { relevance, quality };
  };
}

export type AnalyzeCases = (args: {
  cases: CaseAnalysisInput[];
  concurrency?: number;
}) => Promise<CaseAnalysis[]>;

export function makeAnalyzeCases(args: MakeAnalyzeCaseParams): AnalyzeCases {
  const analyzeCase = makeAnalyzeCase(args);
  return async function analyzeCases({ cases, concurrency = 10 }) {
    const { results, errors } = await PromisePool.for(cases)
      .withConcurrency(concurrency)
      .process(async (caseAnalysisInput) => {
        return await analyzeCase(caseAnalysisInput);
      });
    if (errors.length > 0) {
      console.error(errors);
    }
    return results;
  };
}
