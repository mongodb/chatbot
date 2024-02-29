import { ObjectId, logger } from "mongodb-rag-core";
import { CommandRunMetadata } from "./CommandMetadataStore";
import { ConfigConstructor, EvalConfig } from "./EvalConfig";
import { strict as assert } from "assert";
import { generateDataAndMetadata } from "./generate";
import { generateEvalsAndMetadata } from "./evaluate/generateEvalsAndMetadata";
import { generateReportAndMetadata } from "./report";

type PipelineGenerateFunc = (name: string) => Promise<CommandRunMetadata>;

type PipelineEvaluateFunc = (
  name: string,
  generatedDataRunId: ObjectId
) => Promise<CommandRunMetadata>;

type PipelineReportFunc = (
  name: string,
  evalResultsRunId: ObjectId
) => Promise<CommandRunMetadata>;

export type PipelineFunc = (
  generate: PipelineGenerateFunc,
  evaluate: PipelineEvaluateFunc,
  report: PipelineReportFunc
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
  pipelineFunc: PipelineFunc;
}

/**
  Runs a pipeline of commands from configuration file.
  This is a useful utility for chaining a group of commands.

  For example, you may want to generate one set of converations,
  then generate N evaluations for each conversation,
  and then M reports for each evaluation.
 */
export const runPipeline = async ({
  configConstructor,
  pipelineFunc,
}: RunPipelineParams): Promise<void> => {
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
    return metadata;
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
    return metadata;
  };

  const reportFunc: PipelineReportFunc = async (name, evaluationRunId) => {
    assert(
      commands.report?.[name],
      `Cannot find report command with the name '${name}'.`
    );
    const { reporter } = commands.report[name];
    const { metadata } = await generateReportAndMetadata({
      name,
      reportEvalFunc: reporter,
      reportStore: reportStore,
      evaluationStore: evaluationStore,
      metadataStore: metadataStore,
      evaluationRunId,
    });
    return metadata;
  };

  try {
    logger.info("Running pipeline actions.");
    await pipelineFunc(generateFunc, evaluateFunc, reportFunc);
  } finally {
    await metadataStore.close();
    await generatedDataStore.close();
    await evaluationStore.close();
    await reportStore.close();
    await afterAll?.();
    logger.info("Cleaned up and finished pipeline.");
  }
};
