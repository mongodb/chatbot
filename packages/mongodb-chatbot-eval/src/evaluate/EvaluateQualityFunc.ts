import { SomeGeneratedData } from "../generate/GeneratedDataStore";
import { EvalResult } from "./EvaluationStore";

export type EvaluateQualityFunc = (
  data: SomeGeneratedData
) => Promise<EvalResult>;
