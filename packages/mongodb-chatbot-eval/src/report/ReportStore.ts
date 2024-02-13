import { ObjectId } from "../core";
import { EvalResult } from "../evaluate/EvaluationStore";

export interface Report {
  _id: ObjectId;
  reportName: string;
  data: Record<string, unknown>;
  endTime: Date;
}

export interface ReportStore {
  insertOne(evalResult: EvalResult): Promise<boolean>;
  find(filter: Record<string, unknown>): Promise<Report[] | undefined>;
}

export function makeMongoDbReportStore(): ReportStore {
  return {};
}
