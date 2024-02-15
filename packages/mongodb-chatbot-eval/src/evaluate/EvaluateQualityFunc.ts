import { GeneratedData } from "../generate/GeneratedDataStore";
import { EvalResult } from "./EvaluationStore";

export type EvaluateQualityFunc = (data: GeneratedData) => Promise<EvalResult>;
