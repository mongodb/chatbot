import { makeSimpleTextGenerator } from "./generateText";
import { makeGenerateRating, PromptResponseRating } from "./rating";
import { assessRelevance, makeEmbedders, Relevance } from "./relevance";
import { EmbeddingModel, LanguageModel } from "mongodb-rag-core/aiSdk";
import { PromisePool } from "@supercharge/promise-pool";
import { makeShortName } from "./utils";

export type MakeAnalyzeCaseParams = {
  embeddingModels: EmbeddingModel<string>[];
  generatorModel: LanguageModel;
  judgementModel: LanguageModel;
  ratingStyleGuide?: string;
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

export function makeAnalyzeCase(args: MakeAnalyzeCaseParams): AnalyzeCase {
  const generateRating = makeGenerateRating({
    model: args.judgementModel,
    styleGuide: args.ratingStyleGuide,
  });
  const generateText = makeSimpleTextGenerator({ model: args.generatorModel });
  const embedders = makeEmbedders(args.embeddingModels);

  return async ({ prompt, response }) => {
    console.log(`Analyzing case: '${makeShortName(prompt)}'...`);
    const [relevance, quality] = await Promise.all([
      assessRelevance({
        prompt,
        response,
        generateText,
        embedders,
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
