import { EvalCase } from "mongodb-rag-core/braintrust";
import { BaseCase, Result } from "./EvalCases";
import { ExperimentResult } from "./getBraintrustExperimentResults";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { ExperimentType, ResultsByExperiment } from "./reportBenchmarkResults";
import {
  NlPromptResponseEvalCase,
  NlPromptResponseTaskOutput,
} from "../nlPromptResponse/NlQuestionAnswerEval";
import {
  QuizQuestionEvalCase,
  QuizQuestionTaskOutput,
} from "../quizQuestions/QuizQuestionEval";

type PromptResponseExperimentResult = ExperimentResult<
  NlPromptResponseEvalCase,
  NlPromptResponseTaskOutput,
  string[]
>;

type MultipleChoiceExperimentResult = ExperimentResult<
  QuizQuestionEvalCase,
  QuizQuestionTaskOutput,
  string[]
>;

/**
Accepts the results of multiple experiments in a project. Groups them by the eval case so that results for different models are grouped together for the same case.
 */
export function materializeExperimentResultsByCase<
  ER extends ExperimentResult<
    EvalCase<unknown, unknown, unknown>,
    unknown,
    string[]
  >,
  Case extends BaseCase
>(resultsByExperiment: ResultsByExperiment<ER>, type: ExperimentType): Case[] {
  // Create a map to group results by case ID
  const caseMap = new Map<string, Case>();

  // Process each experiment result
  for (const [experimentName, { results }] of Object.entries(
    resultsByExperiment
  )) {
    // Process each case in the experiment
    switch (type) {
      case "prompt_response": {
        createCases<Case, PromptResponseExperimentResult>({
          caseMap,
          results: results as PromptResponseExperimentResult[],
          experimentName,
          createBaseCase: ({ caseId, result }) => ({
            _id: new ObjectId(),
            type,
            tags: result.tags ?? [],
            name: result.input.messages[0].content,
            prompt: result.input.messages,
            expected: result.expected.reference ?? "",
            metadata: {
              ...result.metadata,
              caseId,
            },
            results: {},
          }),
          createCaseResult: ({ model, result }) => ({
            model,
            provider: providerFromModel(model),
            date: new Date(),
            response: result.output ? result.output.response : "",
            metadata: {},
            metrics: {},
          }),
        });
        break;
      }
      case "multiple_choice": {
        createCases<Case, MultipleChoiceExperimentResult>({
          caseMap,
          results: results as MultipleChoiceExperimentResult[],
          experimentName,
          createBaseCase: ({ caseId, result }) => ({
            _id: new ObjectId(),
            type,
            tags: result.tags ?? [],
            name: result.input.questionText,
            prompt: [
              {
                role: "user",
                content: result.input.questionText,
              },
            ],
            expected: result.expected,
            metadata: {
              ...result.metadata,
              caseId,
            },
            results: {},
          }),
          createCaseResult: ({ model, result }) => ({
            model,
            provider: providerFromModel(model),
            date: new Date(),
            response: result.output ?? "",
            metadata: {},
            metrics: {},
          }),
        });
        break;
      }
      default:
        throw new Error(`Unsupported experiment type: ${type}`);
    }
  }

  return Array.from(caseMap.values());
}
function getCaseId(caseId: string | undefined, input: unknown): string {
  return caseId ?? JSON.stringify(input);
}

function createCases<
  Case extends BaseCase,
  ER extends ExperimentResult<
    EvalCase<unknown, unknown, unknown>,
    unknown,
    string[]
  >
>(args: {
  caseMap: Map<string, Case>;
  results: ER[];
  experimentName: string;
  createBaseCase: (args: { caseId: string; result: ER }) => BaseCase;
  createCaseResult: (args: { model: string; result: ER }) => Result;
}) {
  const { caseMap, experimentName, createBaseCase, createCaseResult } = args;
  for (const result of args.results) {
    const caseId = getCaseId(result.id, result.input);

    // If this case hasn't been seen before, create a new BaseCase
    if (!caseMap.has(caseId)) {
      const baseCase = createBaseCase({ caseId, result });
      caseMap.set(caseId, baseCase as Case);
    }

    // Add this model's output to the case
    const baseCase = caseMap.get(caseId);
    if (!baseCase) {
      throw new Error(`Case ${caseId} not found`);
    }

    const model = parseModelFromExperimentName(experimentName);

    // Store the model output and metrics in the results object
    baseCase.results[model] = createCaseResult({
      model,
      result,
    });

    if (result.scores) {
      addScoresToCase(result.scores, baseCase, model);
    }
  }
}

function addScoresToCase<C extends BaseCase>(
  scores: NonNullable<Record<string, number | null>>,
  baseCase: C,
  model: string
) {
  // Store the scores for this model
  const metrics: Record<string, number> = {};
  for (const [scoreName, scoreValue] of Object.entries(scores)) {
    if (scoreValue !== null && typeof scoreValue === "number") {
      metrics[scoreName] = scoreValue;
    }
  }

  baseCase.results[model].metrics = metrics;
}

function parseModelFromExperimentName(experimentName: string): string {
  // Try to extract model from URL query parameter format
  const modelMatch = experimentName.match(/[?&]model=([^&]+)/);
  if (!modelMatch) {
    return experimentName;
  }
  const modelName =
    modelMatch && modelMatch[1] ? modelMatch[1] : experimentName;

  // Strip any git hash suffix if present (typically 8+ hex characters at the end)
  const hashSuffixMatch = modelName.match(/(.+)-[a-f0-9]{7,}$/);
  if (hashSuffixMatch && hashSuffixMatch[1]) {
    return hashSuffixMatch[1]; // Return the model name without the hash
  }

  // Return the model name (either without hash or the original if no hash was found)
  return modelName;
}

export function providerFromModel(model: string) {
  if (model.includes("gpt") || model.match(/o\d/)) {
    return "OpenAI";
  }
  if (model.includes("claude")) {
    return "Anthropic";
  }
  if (model.includes("gemini") || model.includes("gemma")) {
    return "Google";
  }
  if (model.includes("llama")) {
    return "Meta";
  }
  if (model.includes("nova")) {
    return "Amazon";
  }
  if (model.includes("qwen")) {
    return "Alibaba";
  }
  if (model.includes("deepseek")) {
    return "DeepSeek";
  }
  if (model.includes("mistral")) {
    return "Mistral";
  }
  return "Unknown";
}
