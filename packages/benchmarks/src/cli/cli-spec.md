# Benchmark CLI Spec

By [Ben Perlmutter](mailto:ben.p@mongodb.com), Jul 2, 2025  
Jira: [EAI-1151](https://jira.mongodb.org/browse/EAI-1151) 

## Overview

This document contains the spec for adding a CLI app to the `benchmarks` package in `mongodb/chatbot`. The benchmark CLI will help standardize running the benchmarks. It will have the following benefits:

1. Make it easier to run existing benchmarks on new models when they're released.  
2. Single clear interface for working with benchmarks.  
3. Don't need to make code changes when running new benchmarks (rather, it's passed as CLI config)

## CLI Commands

### `benchmark run`

Args:

1. `--type: string`   
   1. Type of benchmark to run. E.g `nl_to_mognosh`, `multiple_choice`, `nl_qa`, `discovery`, etc.  
   2. See `benchmark list` for all options  
2. `--model: string[]`  
   1. Models to run benchmark on  
   2. Default: all available models  
   3. See `benchmark models list` for all options  
3. `--dataset: string[]`  
   1. Datasets to run benchmark on  
   2. Default: specific to benchmark  
   3. See `benchmark list` for available datasets and defaults.  
4. `--task: string[]`  
   1. Task to run per benchmark (currently only relevant for NL to Mongosh benchmark)  
   2. Default: specific to benchmark.   
   3. See `benchmark list` for available tasks and defaults.  
5. `--taskConcurrency: number`  
   1. Number of Braintrust eval tasks to run at once  
   2. Default: inherited from model config. See `benchmark models list` for model defaults.  
   3. Min: 1  
   4. Max: 50  
6. `--modelConcurrency: number`  
   1. Number of models to run experiments on at once  
   2. Default: 2  
   3. Min: 1  
   4. Max: 5

### `benchmark list`

Shows all config about different benchmarks, including:

1. Available types  
   1. For each type:  
      1. Datasets, including which is default  
      2. Tasks, including which is default

### `benchmark models list`

Show all models config. Include all the `ModelConfig` (from `mongodb-rag-core/models`) for the models available for benchmarking.

## CLI Config

Sketch of the typing for the configuration:

```ts
import { ModelConfig } from "mongodb-rag-core/models";

// Note: will wanna add some typing on this so that all benchmark configs
// are typesafe between tasks and datasets
interface BenchmarkConfig {
  description?: string;
  datasets: Record<string, BenchmarkDataset>;
  tasks: Record<string, BenchmarkTask>
}

interface BenchmarkDataset {
  default?: boolean;
  description?: string;
  getDataset: ()=><EvalCase[]> 
}

interface BenchmarkTask {
  taskFunc: BtTask;
  description?: string;
}


interface BenchmarkCliConfig {
  models: ModelConfig[];
  benchmarks: Record<string, BenchmarkConfig>;
  
}
```

## Implementation Details

1. CLI should live within the `benchmarks` project (i.e. no new package)  
2. Can use npm CLI package like `yargs`  
3. For the time being, let's not make it so that you can pass different configurations (like we do for ingest CLI). Instead let's create a constructor function that takes a `BenchmarkCliConfig` object. E.g. `makeBenchmarkCliConfig(config: BenchmarkCliConfig)`

## Example Commands

```shell
# Run a benchmark across 2 models
benchmark run --type nl_qa --model gpt-4.1 --model llama-3.3-70b 

# Run a benchmark with a specific task
benchmark run --type nl_to_mongosh --task agentic --model claude-3.7-sonnet --taskConcurrency 3

# List all benchmarks 
benchmark list

# List all models
benchmark models list


```
