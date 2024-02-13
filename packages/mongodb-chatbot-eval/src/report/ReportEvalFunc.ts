import { EvalResult } from "../evaluate/EvaluationStore";

export type ReportEvalFunc = (evalution: EvalResult) => Promise<Report>;
