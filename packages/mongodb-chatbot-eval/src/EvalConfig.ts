import { CommandMetadataStore } from "./CommandMetadataStore";
import { EvaluateQualityFunc } from "./evaluate/EvaluateQualityFunc";
import { EvaluationStore } from "./evaluate/EvaluationStore";
import { GenerateDataFunc } from "./generate/GenerateDataFunc";
import { GeneratedDataStore } from "./generate/GeneratedDataStore";
import { SomeTestCase } from "./generate/TestCase";
import { ReportEvalFunc } from "./report/ReportEvalFunc";
import { ReportStore } from "./report/ReportStore";

export interface EvalConfig {
  metadataStore: CommandMetadataStore;
  generatedDataStore: GeneratedDataStore;
  evaluationStore: EvaluationStore;
  reportStore: ReportStore;
  commands: {
    generate?: {
      [k: string]: {
        type: string;
        testCases: SomeTestCase[];
        generator: GenerateDataFunc;
      };
    };
    evaluate?: {
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

  /**
    Function that runs after all actions in the eval command.
    Can use for things like cleaning up resources besides the stores.
    The stores are cleaned up automatically.
   */
  afterAll?: () => Promise<void>;
}

export type ConfigConstructor = () => Promise<EvalConfig>;
