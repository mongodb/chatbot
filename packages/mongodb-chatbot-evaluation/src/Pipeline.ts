import { ObjectId } from "mongodb-rag-core/mongodb";
import { logger } from "mongodb-rag-core";
import { CommandRunMetadata } from "./CommandMetadataStore";
import { ConfigConstructor, EvalConfig } from "./EvalConfig";
import { strict as assert } from "assert";
import { generateDataAndMetadata } from "./generate";
import { generateEvalsAndMetadata } from "./evaluate/generateEvalsAndMetadata";
import { generateReportAndMetadata, Report } from "./report";

type PipelineGenerateFunc = (
  name: string
) => Promise<{ commandRunMetadata: CommandRunMetadata }>;

type PipelineEvaluateFunc = (
  name: string,
  generatedDataRunId: ObjectId
) => Promise<{ commandRunMetadata: CommandRunMetadata }>;

type PipelineReportFunc = (
  name: string,
  evalResultsRunId: ObjectId
) => Promise<{ commandRunMetadata: CommandRunMetadata; report: Report }>;

export type Pipeline = (
  generate: PipelineGenerateFunc,
  evaluate: PipelineEvaluateFunc,
  report: PipelineReportFunc,
  config: EvalConfig
) => Promise<void>;

interface RunPipelineParams {
  /**
    A function that returns an {@link EvalConfig}.
    This can be the same function as what you export from your configuration file.
   */
  configConstructor: ConfigConstructor;

  /**
    A function that takes `generate`, `evaluate`, and `report` functions
    based on your configuration and runs a pipeline of commands.

    These functions have the same behavior as the CLI commands,
    creating the relevant data in their respective stores
    and adding the command metadata.
   */
  pipeline: Pipeline;
}

/**
  Runs a pipeline of commands from configuration file.
  This is a useful utility for chaining a group of commands.

  For example, you may want to generate one set of converations,
  then generate N evaluations for each conversation,
  and then M reports for each evaluation.
 */
export async function runPipeline({
  configConstructor,
  pipeline,
}: RunPipelineParams): Promise<void> {
  logger.info("Starting pipeline.");
  logger.info("Constructing pipeline config.");

  const config = await configConstructor();
  const {
    metadataStore,
    generatedDataStore,
    evaluationStore,
    reportStore,
    commands,
    afterAll,
  } = config;

  const generateFunc: PipelineGenerateFunc = async (name) => {
    assert(
      commands.generate?.[name],
      `Cannot find generate command with the name '${name}'.`
    );
    const { testCases, generator } = commands.generate[name];
    const { metadata } = await generateDataAndMetadata({
      testCases,
      name,
      generator,
      generatedDataStore: generatedDataStore,
      metadataStore: metadataStore,
    });
    return { commandRunMetadata: metadata };
  };

  const evaluateFunc: PipelineEvaluateFunc = async (
    name,
    generatedDataRunId
  ) => {
    assert(
      commands.evaluate?.[name],
      `Cannot find evaluate command with the name '${name}'.`
    );
    const { evaluator } = commands.evaluate[name];
    const { metadata } = await generateEvalsAndMetadata({
      name,
      evaluator,
      generatedDataRunId,
      generatedDataStore: generatedDataStore,
      evaluationStore: evaluationStore,
      metadataStore: metadataStore,
    });
    return { commandRunMetadata: metadata };
  };

  const reportFunc: PipelineReportFunc = async (name, evaluationRunId) => {
    assert(
      commands.report?.[name],
      `Cannot find report command with the name '${name}'.`
    );
    const { reporter } = commands.report[name];
    const { metadata, report } = await generateReportAndMetadata({
      name,
      reportEvalFunc: reporter,
      reportStore: reportStore,
      evaluationStore: evaluationStore,
      metadataStore: metadataStore,
      evaluationRunId,
    });
    return { commandRunMetadata: metadata, report };
  };

  try {
    logger.info("Running pipeline actions.");
    await pipeline(generateFunc, evaluateFunc, reportFunc, config);
  } catch (err) {
    logger.error("Error running pipeline actions.");
    logger.error(err);
    throw err;
  } finally {
    await metadataStore.close();
    await generatedDataStore.close();
    await evaluationStore.close();
    await reportStore.close();
    await afterAll?.();
    logger.info("Cleaned up and finished pipeline. Exiting process.");
    process.exit(0);
  }
}
