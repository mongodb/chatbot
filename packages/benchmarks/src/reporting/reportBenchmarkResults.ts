import { EvalCase } from "mongodb-rag-core/braintrust";
import { BaseCase } from "./EvalCases";
import {
  ExperimentResult,
  getBraintrustExperimentResults,
} from "./getBraintrustExperimentResults";
import { listBraintrustExperiments } from "./listBraintrustExperiments";
import { materializeExperimentResultsByCase } from "./materializeExperimentResultsByCase";
import {
  getBraintrustExperimentSummary,
  GetExperimentMetadataResponse,
} from "./getBraintrustExperimentSummary";
import assert from "assert";

export type ExperimentType =
  | "prompt_response"
  | "natural_language_to_code"
  | "multiple_choice";

export interface ReportBenchmarkResultsParams {
  apiKey: string;
  projectName: string;
  experimentType: ExperimentType;
}

export type ResultsByExperiment = Record<
  string,
  {
    results: ExperimentResult<
      EvalCase<unknown, unknown, unknown>,
      unknown,
      string[]
    >[];
    metadata: GetExperimentMetadataResponse;
  }
>;

export async function reportBenchmarkResults<Case extends BaseCase>({
  apiKey,
  projectName,
  experimentType,
}: ReportBenchmarkResultsParams): Promise<Case[]> {
  const experiments = await listBraintrustExperiments({
    apiKey,
    queryParams: {
      project_name: projectName,
    },
  });
  const allExperimentResults: ResultsByExperiment = {};
  for (const experiment of experiments) {
    const results = await getBraintrustExperimentResults({
      apiKey,
      experimentName: experiment.name,
      projectName,
    });
    const { metadata } = await getBraintrustExperimentSummary({
      apiKey,
      experimentName: experiment.name,
      projectName,
    });
    allExperimentResults[experiment.name] = { results, metadata };
  }
  return materializeExperimentResultsByCase<Case>(
    allExperimentResults,
    experimentType
  );
}
