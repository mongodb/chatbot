import { EvalCase, Experiment, init } from "mongodb-rag-core/braintrust";
export interface GetBraintrustExperimentAndScoresParams {
  experimentName: string;
  projectName: string;
  apiKey: string;
}
export async function getBraintrustExperimentAndScores({
  projectName,
  experimentName,
  apiKey,
}: GetBraintrustExperimentAndScoresParams) {
  const experiment = await init(projectName, {
    experiment: experimentName,
    apiKey,
    open: true,
  });
  const experimentRows = await experiment.fetchedData();
  return experimentRows.map(getEvalCaseAndScores);
}

export function getEvalCaseAndScores<
  EC extends EvalCase<unknown, unknown, unknown>,
  Output
>(
  experimentEvent: Awaited<ReturnType<Experiment["fetchedData"]>>[number]
): {
  evalCase: EC;
  scores?: Record<string, number | null>;
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
