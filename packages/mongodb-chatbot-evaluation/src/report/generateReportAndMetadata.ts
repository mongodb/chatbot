import { logger } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
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
    reportName: name,
  });
  await reportStore.insertOne(report);

  const endTime = new Date();
  const metadata = {
    _id: runId,
    command: "report",
    name,
    startTime,
    endTime,
  } satisfies CommandRunMetadata;
  await metadataStore.insertOne(metadata);
  logger.info(
    `Generated report of type '${report.type}' for command '${name}':`
  );
  logger.info(report);
  logger.info(metadata);
  return { report, metadata };
}
