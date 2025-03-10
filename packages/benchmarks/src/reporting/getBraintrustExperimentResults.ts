import { EvalCase, Experiment, init } from "mongodb-rag-core/braintrust";
import { aggregateScoresByTag } from "./aggregateScoresByTag";

export interface GetBraintrustExperimentResults {
  experimentName: string;
  projectName: string;
  apiKey: string;
}

export interface ExperimentResults<
  EC extends EvalCase<unknown, unknown, unknown>,
  Output,
  ScoreTypes extends string[]
> {
  evalCase: EC;
  scores?: Record<ScoreTypes[number], number | null>;
  output?: Output;
}

export async function getBraintrustExperimentResults<
  EC extends EvalCase<unknown, unknown, unknown>,
  Output,
  ScoreTypes extends string[]
>({
  projectName,
  experimentName,
  apiKey,
}: GetBraintrustExperimentResults): Promise<
  ExperimentResults<EC, Output, ScoreTypes>[]
> {
  const experiment = await init(projectName, {
    experiment: experimentName,
    apiKey,
    open: true,
  });
  const experimentRows = await experiment.fetchedData();
  return experimentRows.map(getEvalCaseAndScores<EC, Output, ScoreTypes>);
}

export function getEvalCaseAndScores<
  EC extends EvalCase<unknown, unknown, unknown>,
  Output,
  ScoreTypes extends string[]
>(
  experimentEvent: Awaited<ReturnType<Experiment["fetchedData"]>>[number]
): {
  evalCase: EC;
  scores?: Record<ScoreTypes[number], number | null>;
  output?: Output;
} {
  const evalCase = {
    input: experimentEvent.input,
    tags: experimentEvent.tags,
    expected: experimentEvent.expected,
    metadata: experimentEvent.metadata,
  } as EC;
  const output = experimentEvent.output as Output;
  const scores = experimentEvent.scores;
  return { evalCase, scores, output };
}

export async function aggregateScoresByTagForBraintrustExperiment<
  EC extends EvalCase<unknown, unknown, unknown>,
  Output,
  ScoreTypes extends string[]
>({ experimentName, projectName, apiKey }: GetBraintrustExperimentResults) {
  const results = await getBraintrustExperimentResults<EC, Output, ScoreTypes>({
    experimentName,
    projectName,
    apiKey,
  });

  // Get all the unique score types in the results
  const scoreNames = new Set(
    results.flatMap((result) => Object.keys(result.scores || {}))
  );
  const scoreTypes = Array.from(scoreNames) as ScoreTypes;

  return aggregateScoresByTag(results, scoreTypes);
}
