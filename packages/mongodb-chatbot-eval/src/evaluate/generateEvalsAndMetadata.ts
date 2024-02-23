import { ObjectId, logger } from "mongodb-rag-core";
import {
  CommandMetadataStore,
  CommandRunMetadata,
} from "../CommandMetadataStore";
import { GeneratedDataStore } from "../generate";
import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { EvalResult, EvaluationStore } from "./EvaluationStore";
import { strict as assert } from "assert";

export type GenerateEvalsAndMetadataParams = {
  name: string;
  evaluator: EvaluateQualityFunc;
  generatedDataStore: GeneratedDataStore;
  evaluationStore: EvaluationStore;
  metadataStore: CommandMetadataStore;
  generatedDataRunId?: ObjectId;
  defaultGeneratedDataQuery?: unknown;
};

export async function generateEvalsAndMetadata({
  name,
  evaluator,
  generatedDataRunId,
  generatedDataStore,
  evaluationStore,
  metadataStore,
  defaultGeneratedDataQuery,
}: GenerateEvalsAndMetadataParams) {
  const evalResults: EvalResult[] = [];
  const failedCases: ObjectId[] = [];
  const startTime = new Date();
  const runId = new ObjectId();

  assert(
    generatedDataRunId || defaultGeneratedDataQuery,
    "No generated data query or run ID provided."
  );
  const generatedData = generatedDataRunId
    ? await generatedDataStore.findByCommandRunId(generatedDataRunId)
    : await generatedDataStore.find(defaultGeneratedDataQuery);
  assert(generatedData, "No generated data found for the given query.");

  logger.info(
    `Evaluating ${generatedData.length} pieces of generated data for the '${name}' command.`
  );
  // do stuff
  for (const generation of generatedData) {
    logger.info(
      `Evaluating generated data with _id '${generation._id.toHexString()}' and type '${
        generation.type
      }'`
    );
    try {
      const evalResult = await evaluator({ runId, generatedData: generation });
      evalResults.push(evalResult);
    } catch (error) {
      logger.error(
        `Failed to evaluate generated data: ${generation._id.toHexString()}`
      );
      failedCases.push(generation._id);
    }
  }
  await evaluationStore.insertMany(evalResults);

  const endTime = new Date();
  const metadata = {
    _id: runId,
    command: "evaluate",
    name,
    startTime,
    endTime,
  } satisfies CommandRunMetadata;
  await metadataStore.insertOne(metadata);
  logger.info(
    `Generated evaluations for ${evalResults.length}/${generatedData.length} pieces of generated data for command '${name}'`
  );
  logger.info(metadata);
  return { evalResults, failedCases, metadata };
}
