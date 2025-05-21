import { EvalCase } from "mongodb-rag-core/braintrust";
import { BaseCase } from "./EvalCases";
import { ExperimentResult } from "./getBraintrustExperimentResults";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { ExperimentType, ResultsByExperiment } from "./reportBenchmarkResults";
import {
  NlPromptResponseEvalCase,
  NlPromptResponseTaskOutput,
} from "../nlPromptResponse/NlQuestionAnswerEval";

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
      case "prompt_response":
        for (const evalCase of results as ExperimentResult<
          NlPromptResponseEvalCase,
          NlPromptResponseTaskOutput,
          string[]
        >[]) {
          const caseId = getCaseId(evalCase.id, evalCase.input);

          // If this case hasn't been seen before, create a new BaseCase
          if (!caseMap.has(caseId)) {
            const baseCase: BaseCase = {
              id: new ObjectId(),
              type,
              tags: evalCase.tags ?? [],
              name: evalCase.input.messages[0].content,
              prompt: evalCase.input.messages,
              expected: evalCase.expected.reference ?? "",
              // Populate results subsequently
              results: {},
            };
            caseMap.set(caseId, baseCase as Case);
          }

          // Add this model's output to the case
          const baseCase = caseMap.get(caseId);
          if (!baseCase) {
            throw new Error(`Case ${caseId} not found`);
          }

          const model = parseModelFromExperimentName(experimentName);

          // Store the model output and metrics in the results object
          baseCase.results[model] = {
            model,
            provider: providerFromModel(model),
            date: new Date(),
            response: evalCase.output ? evalCase.output.response : "",
            metrics: {},
          };

          if (evalCase.scores) {
            addScoresToCase(evalCase.scores, baseCase, model);
          }
        }
        break;
      default:
        throw new Error(`Unsupported experiment type: ${type}`);
    }
  }

  // Convert map to array for return
  return Array.from(caseMap.values());
}
function getCaseId(caseId: string | undefined, input: unknown): string {
  return caseId ?? JSON.stringify(input);
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
  if (model.includes('claude')) {
    return 'Anthropic';
  }
  if (model.includes('qwen')) {
    return 'Qwen';
  }
  if (model.includes('deepseek')) {
    return 'DeepSeek';
  }
  if (model.includes('llama')) {
    return 'Meta';
  }
  if (model.includes('mistral')) {
    return 'Mistral';
  }
  if (model.includes('gemini') || model.includes('gemma')) {
    return 'Google';
  }
  if (model.includes('nova')) {
    return 'Amazon';
  }
  if (model.includes('gpt') || model.match(/o\d/)) {
    return 'OpenAI';
  }
  return 'Unknown';
}
