import { ObjectId } from "mongodb-rag-core";
import { EvaluationStore } from "../evaluate/EvaluationStore";
import { Report } from "./ReportStore";

export interface ReportEvalFuncParams {
  runId: ObjectId;
  evaluationStore: EvaluationStore;
  evaluationRunId: ObjectId;
}

export type ReportEvalFunc = (params: ReportEvalFuncParams) => Promise<Report>;
