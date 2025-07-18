import PromisePool from "@supercharge/promise-pool";
import { Eval } from "mongodb-rag-core/braintrust";
import { BenchmarkCliConfig } from "./BenchmarkConfig";
import { makeExperimentName } from "../makeExperimentName";
import { ModelConfig } from "mongodb-rag-core/models";

export interface RunBenchmarkArgs {
  type: string;
  task: string;
  models: ModelConfig[];
  datasets: string[];
  taskConcurrency?: number;
  modelConcurrency: number;
}

export async function runBenchmark(
  config: BenchmarkCliConfig,
  {
    type,
    task,
    models,
    datasets,
    taskConcurrency,
    modelConcurrency,
  }: RunBenchmarkArgs
) {
  const benchmarkConfig = config.benchmarks[type];
  if (!benchmarkConfig) {
    throw new Error(`Unknown benchmark type: ${type}`);
  }

  // Resolve datasets
  const datasetsToRun = Object.entries(benchmarkConfig.datasets).filter(
    ([name]) => datasets.includes(name)
  );

  if (datasetsToRun.length === 0) {
    throw new Error("No valid datasets found");
  }

  // Resolve tasks
  const taskToRun = Object.entries(benchmarkConfig.tasks).find(([name]) =>
    task.includes(name)
  )?.[1];

  if (!taskToRun) {
    throw new Error("No valid tasks found");
  }

  console.log(`Running benchmark: ${type}`);
  console.log(`Model(s): ${models.map((m) => m.label).join(", ")}`);
  console.log(`Dataset(s): ${datasetsToRun.map(([name]) => name).join(", ")}`);
  console.log(`Task: ${taskToRun}`);
  console.log(`Model concurrency: ${modelConcurrency}`);

  // Run benchmarks with model concurrency
  const { results } = await PromisePool.for(models)
    .withConcurrency(modelConcurrency)
    .handleError((error) => {
      console.error(error);
    })
    .process(async (model) => {
      const maxConcurrency = taskConcurrency ?? model.maxConcurrency ?? 1;

      console.log(`Running experiments for model: ${model.label}`);

      // Run each task-dataset combination

      const dataset = (
        await Promise.all(
          datasetsToRun.map(([_datasetName, datasetConfig]) =>
            datasetConfig.getDataset()
          )
        )
      ).flat();
      const datasetName = datasetsToRun.map(([name]) => name).join("+");

      const experimentName = makeExperimentName({
        baseName: type,
        experimentType: task,
        datasets: datasetName,
        model: model.label,
      });

      console.log(`Running experiment: ${experimentName}`);

      const scores = Object.values(benchmarkConfig.scorers).map(
        (scorer) => scorer.scorerFunc
      );

      try {
        // Load dataset
        // Run evaluation
        const evalResult = await Eval(benchmarkConfig.projectName, {
          data: dataset,
          experimentName,
          maxConcurrency,
          metadata: {
            model: model.label,
            task,
            dataset: datasetName,
            taskConcurrency,
          },
          task: taskToRun.taskFunc(config.modelProvider, model.deployment),
          scores,
        });

        console.log(`✓ Completed experiment: ${experimentName}`);
        return evalResult;
      } catch (error) {
        console.error(`✗ Failed experiment: ${experimentName}`, error);
      }
    });

  console.log("Benchmark run completed");
  return results;
}
