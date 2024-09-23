import { Eval, EvalTask, initDataset } from "braintrust";

export interface MakeEvalParams {
  projectName: string;
  maxConcurrency?: number;
  timeout?: number;
  experimentName: string;
  metadata?: Record<string, unknown>;
  // TODO: apply typing
  modelName: string;
  dataset: {
    name: string;
    version?: string;
  };
}
export async function runTextToDriverEval({
  projectName,
  experimentName,
  modelName,
  metadata,
  maxConcurrency = 3,
  timeout = 30000,
  dataset,
}: MakeEvalParams) {
  const task = makeTextToDriverTask({ modelName });
  return Eval(projectName, {
    maxConcurrency,
    experimentName,
    timeout,
    metadata,
    // TODO: add when PR ready...
    // Maybe will be language specific?
    scores: [],
    data: initDataset({
      dataset: dataset.name,
      project: projectName,
      version: dataset.version,
    }),
    // Definitely language specific
    task,
  });
}

export interface MakeTextToDriverTaskParams {
  modelName: string;
}
export function makeTextToDriverTask(params: MakeTextToDriverTaskParams) {
  return (input: string) => {
    return input;
  };
}
