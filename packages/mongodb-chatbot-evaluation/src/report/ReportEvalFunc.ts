import { ObjectId } from "mongodb-rag-core/mongodb";
import { EvaluationStore } from "../evaluate/EvaluationStore";
import { Report } from "./ReportStore";

export interface ReportEvalFuncParams {
  runId: ObjectId;
  evaluationStore: EvaluationStore;
  evaluationRunId: ObjectId;
  reportName: string;
}

export type ReportEvalFunc = (params: ReportEvalFuncParams) => Promise<Report>;
