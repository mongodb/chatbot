import { ObjectId } from "mongodb-rag-core";
import { SomeGeneratedData } from "../generate/GeneratedDataStore";
import { EvalResult } from "./EvaluationStore";

interface EvaluateQualityFuncParams {
  runId: ObjectId;
  generatedData: SomeGeneratedData;
}

export type EvaluateQualityFunc = (
  params: EvaluateQualityFuncParams
) => Promise<EvalResult>;
