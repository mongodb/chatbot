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
>({ projectName, experimentName, apiKey }: GetBraintrustExperimentResults) {
  // : Promise<
  //   ExperimentResults<EC, Output, ScoreTypes>[]
  // >
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
  // return dataset;
  //.map(getEvalCaseAndScores<EC, Output, ScoreTypes>);
  // .filter((r) => r.scores && r.evalCase.tags);
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

// export async function aggregateScoresByTagForBraintrustExperiment<
//   EC extends EvalCase<unknown, unknown, unknown>,
//   Output,
//   ScoreTypes extends string[]
// >({ experimentName, projectName, apiKey }: GetBraintrustExperimentResults) {
//   const results = await getBraintrustExperimentResults<EC, Output, ScoreTypes>({
//     experimentName,
//     projectName,
//     apiKey,
//   });
//   console.log(results.slice(0, 5));

//   // Get all the unique score types in the results
//   const scoreNames = new Set(
//     results.flatMap((result) => Object.keys(result.scores || {}))
//   );
//   const scoreTypes = Array.from(scoreNames) as ScoreTypes;
//   const aggregates = aggregateScoresByTag(results, scoreTypes);
//   console.log({ scoreTypes, numRes: results.length, aggregates });
//   return aggregates;
// }
