import { ModelConfig } from "mongodb-rag-core/models";
import {
  BaseMetadata,
  DefaultMetadataType,
  EvalCase,
  EvalScorer,
  EvalTask,
} from "braintrust";

export interface BenchmarkDataset<Input, Expected, Metadata> {
  description?: string;
  getDataset: () => Promise<EvalCase<Input, Expected, Metadata>[]>;
}

export interface BenchmarkTask<
  Input,
  Output,
  Expected,
  Metadata extends BaseMetadata = DefaultMetadataType
> {
  taskFunc: (
    modelProvider: ModelProvider,
    deployment: ModelConfig
  ) => EvalTask<Input, Output, Expected, Metadata>;
  description?: string;
}

export interface BenchmarkScorer<
  Input,
  Output,
  Expected,
  Metadata extends BaseMetadata
> {
  scorerFunc: EvalScorer<Input, Output, Expected, Metadata>;
  description?: string;
}

export interface BenchmarkConfig<
  Input = unknown,
  Output = unknown,
  Expected = unknown,
  Metadata extends BaseMetadata = DefaultMetadataType
> {
  description?: string;
  projectName: string;
  datasets: Record<string, BenchmarkDataset<Input, Expected, Metadata>>;
  tasks: Record<string, BenchmarkTask<Input, Output, Expected, Metadata>>;
  scorers: Record<string, BenchmarkScorer<Input, Output, Expected, Metadata>>;
}

export type ModelProvider = {
  baseUrl: string;
  apiKey: string;
};

export interface BenchmarkCliConfig {
  models: ModelConfig[];
  modelProvider: ModelProvider;
  benchmarks: Record<string, BenchmarkConfig<any, any, any, any>>;
}
