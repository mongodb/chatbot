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

export type ExperimentType =
  | "prompt_response"
  | "natural_language_to_code"
  | "multiple_choice";

export interface ReportBenchmarkResultsParams {
  apiKey: string;
  projectName: string;
  experimentType: ExperimentType;
}

export type ResultsByExperiment<
  ER extends ExperimentResult<
    EvalCase<unknown, unknown, unknown>,
    unknown,
    string[]
  >
> = Record<
  string,
  {
    results: ER[];
    metadata: GetExperimentMetadataResponse;
  }
>;

export async function reportBenchmarkResults<
  ER extends ExperimentResult<
    EvalCase<unknown, unknown, unknown>,
    unknown,
    string[]
  >,
  Case extends BaseCase
>({
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
  const allExperimentResults: ResultsByExperiment<ER> = {};
  for (const experiment of experiments) {
    const results = await getBraintrustExperimentResults<
      ER,
      ER["output"],
      string[]
    >({
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
  return materializeExperimentResultsByCase<ER, Case>(
    allExperimentResults,
    experimentType
  );
}
