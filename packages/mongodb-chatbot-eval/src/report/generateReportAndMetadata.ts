import { ObjectId, logger } from "mongodb-rag-core";
import {
  CommandMetadataStore,
  CommandRunMetadata,
} from "../CommandMetadataStore";
import { EvaluationStore } from "../evaluate/EvaluationStore";
import { ReportStore } from "./ReportStore";
import { ReportEvalFunc } from "./ReportEvalFunc";

export type GenerateReportAndMetadataParams = {
  name: string;
  reportEvalFunc: ReportEvalFunc;
  reportStore: ReportStore;
  evaluationStore: EvaluationStore;
  metadataStore: CommandMetadataStore;
  evaluationRunId: ObjectId;
};

export async function generateReportAndMetadata({
  name,
  reportEvalFunc,
  reportStore,
  evaluationStore,
  metadataStore,
  evaluationRunId,
}: GenerateReportAndMetadataParams) {
  const startTime = new Date();
  const runId = new ObjectId();

  logger.info(`Creating report for the the '${name}' command.`);

  const report = await reportEvalFunc({
    runId,
    evaluationStore,
    evaluationRunId,
  });
  reportStore.insertOne(report);

  const endTime = new Date();
  const metadata = {
    _id: runId,
    command: "evaluate",
    name,
    startTime,
    endTime,
  } satisfies CommandRunMetadata;
  await metadataStore.insertOne(metadata);
  logger.info(`Generated report ${report.reportName}`);
  logger.info(metadata);
  return { report, metadata };
}
