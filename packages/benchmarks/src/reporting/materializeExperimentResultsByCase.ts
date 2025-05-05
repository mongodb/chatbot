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
export function materializeExperimentResultsByCase<Case extends BaseCase>(
  results: ResultsByExperiment,
  type: ExperimentType
): Case[] {
  // Create a map to group results by case ID
  const caseMap = new Map<string, Case>();

  // Process each experiment result
  for (const [experimentName, experimentResults] of Object.entries(results)) {
    // Process each case in the experiment
    switch (type) {
      case "prompt_response":
        for (const evalCase of experimentResults as ExperimentResult<
          NlPromptResponseEvalCase,
          NlPromptResponseTaskOutput,
          string[]
        >[]) {
          // ExperimentResult is an extension of EvalCase, so we can access id directly
          const caseId = evalCase.id ?? JSON.stringify(evalCase.input);

          // If this case hasn't been seen before, create a new BaseCase
          if (!caseMap.has(caseId)) {
            // Create an ObjectId - safely handle non-standard ID formats
            const id = new ObjectId();

            const baseCase: BaseCase = {
              id,
              // Use appropriate fallbacks for required fields
              type,
              tags: evalCase.tags ?? [],
              name: evalCase.input.messages[0].content,
              prompt: evalCase.input.messages,
              expected: evalCase.expected.reference ?? "",
              results: {},
            };
            caseMap.set(caseId, baseCase as Case);
          }

          // Add this model's output to the case
          const baseCase = caseMap.get(caseId)! as Case;

          const model = parseModelFromExperimentName(experimentName);

          // Store the model output and metrics in the results object
          baseCase.results[model] = {
            model,
            date: new Date(),
            response: evalCase.output ? evalCase.output.response : "",
            metrics: {},
          };

          // Store the scores for this model
          if (evalCase.scores) {
            const metrics: Record<string, number> = {};
            for (const [scoreName, scoreValue] of Object.entries(
              evalCase.scores
            )) {
              if (scoreValue !== null && typeof scoreValue === "number") {
                metrics[scoreName] = scoreValue;
              }
            }

            baseCase.results[model].metrics = metrics;
          }
        }
    }
  }

  // Convert map to array for return
  return Array.from(caseMap.values());
}

function parseModelFromExperimentName(experimentName: string): string {
  // Try to extract model from URL query parameter format
  const modelMatch = experimentName.match(/[?&]model=([^&]+)/);
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
