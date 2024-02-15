import { CommandMetadataStore } from "./CommandMetadataStore";
import { EvaluateQualityFunc } from "./evaluate/EvaluateQualityFunc";
import { EvaluationStore } from "./evaluate/EvaluationStore";
import { GenerateDataFunc } from "./generate/GenerateDataFunc";
import { GeneratedDataStore } from "./generate/GeneratedDataStore";
import { TestCase } from "./generate/TestCase";
import { ReportEvalFunc } from "./report/ReportEvalFunc";
import { ReportStore } from "./report/ReportStore";

/**
  Config
 */
export interface EvalConfig {
  metadataStore: CommandMetadataStore;
  generatedDataStore: GeneratedDataStore;
  evaluationStore: EvaluationStore;
  reportStore: ReportStore;
  commands: {
    generate?: {
      [k: string]: {
        type: string;
        testCases: TestCase[];
        generator: GenerateDataFunc;
      };
    };
    eval?: {
      [k: string]: {
        evaluator: EvaluateQualityFunc;
      };
    };
    report?: {
      [k: string]: {
        reporter: ReportEvalFunc;
      };
    };
  };
}

export type ConfigConstructor = () => Promise<EvalConfig>;
