import { EvalCase, init } from "mongodb-rag-core/braintrust";

export interface GetBraintrustExperimentResults {
  experimentName: string;
  projectName: string;

  apiKey: string;
}

export type ExperimentResult<
  EC extends EvalCase<unknown, unknown, unknown>,
  Output,
  ScoreTypes extends string[]
> = EC & {
  scores?: Record<ScoreTypes[number], number | null>;
  output?: Output;
};

export async function getBraintrustExperimentResults<
  EC extends EvalCase<unknown, unknown, unknown>,
  Output,
  ScoreTypes extends string[]
>({
  projectName,
  experimentName,
  apiKey,
}: GetBraintrustExperimentResults): Promise<
  ExperimentResult<EC, Output, ScoreTypes>[]
> {
  const experiment = await init(projectName, {
    experiment: experimentName,
    apiKey,
    open: true,
  });
  const dataset = await experiment.fetchedData();
  const materializedRows: Record<
    string,
    EC & {
      scores?: Record<ScoreTypes[number], number | null>;
      output?: Output;
    }
  > = {};

  // Collect all results from the async generator
  for await (const item of dataset) {
    if (item.root_span_id) {
      if (!materializedRows[item.root_span_id]) {
        materializedRows[item.root_span_id] = {} as unknown as EC;
      }
      if (item?.span_attributes?.type === "score") {
        materializedRows[item.root_span_id].scores = {
          ...materializedRows[item.root_span_id].scores,
          ...(item.scores as Record<ScoreTypes[number], number | null>),
        } as Record<ScoreTypes[number], number | null>;
      } else if (item?.span_attributes?.type === "task") {
        materializedRows[item.root_span_id].output = item.output as Output;
      } else if (item?.span_attributes?.type === "eval") {
        materializedRows[item.root_span_id].input = item.input as EC["input"];
        materializedRows[item.root_span_id].tags = item.tags;
        materializedRows[item.root_span_id].expected = item.expected;
        materializedRows[item.root_span_id].metadata = item.metadata;
      }
    }
  }

  return Object.values(materializedRows);
}
