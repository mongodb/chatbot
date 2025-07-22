import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { BenchmarkCliConfig } from "./BenchmarkConfig";
import { runBenchmark, RunBenchmarkArgs } from "./runBenchmark";

export function createBenchmarkCli(config: BenchmarkCliConfig) {
  return yargs(hideBin(process.argv))
    .command(
      "run",
      "Run a benchmark",
      (yargs) => {
        return yargs
          .option("type", {
            type: "string",
            describe: "Type of benchmark to run.",
            demandOption: true,
          })
          .option("model", {
            type: "array",
            describe: "Models to run benchmark on.",
            string: true,
          })
          .option("dataset", {
            type: "array",
            describe:
              "Datasets to run benchmark on. Defaults to first dataset if no value provided.",
            string: true,
          })
          .option("task", {
            type: "string",
            describe:
              "Tasks to run per benchmark. Defaults to first provided task for type.",
          })
          .option("taskConcurrency", {
            type: "number",
            describe:
              "Number of Braintrust eval tasks to run at once. Default is model's maxConcurrency.",
            default: undefined,
          })
          .option("modelConcurrency", {
            type: "number",
            describe:
              "Number of models to run experiments on at once. Default is 2.",
            default: 2,
          })
          .check((argv) => {
            const errors: string[] = [];
            // Check if benchmark type exists
            if (!config.benchmarks[argv.type]) {
              errors.push(
                `Unknown benchmark type: ${argv.type}. Use 'benchmark list' to see available types.`
              );
            }

            // Validate tasks exist
            if (argv.task && !config.benchmarks[argv.type].tasks[argv.task]) {
              errors.push(
                `Unknown task: ${argv.task}. Use 'benchmark list' to see available tasks for type ${argv.type}.`
              );
            }

            // Validate datasets exist
            for (const dataset of argv.dataset ?? []) {
              if (!config.benchmarks[argv.type].datasets[dataset]) {
                errors.push(
                  `Unknown dataset: ${dataset}. Use 'benchmark list' to see available datasets for type ${argv.type}.`
                );
              }
            }

            // Validate taskConcurrency
            if (
              argv.taskConcurrency !== undefined &&
              (!Number.isInteger(argv.taskConcurrency) ||
                argv.taskConcurrency < 1 ||
                argv.taskConcurrency > 50)
            ) {
              errors.push("taskConcurrency must be integer between 1 and 50");
            }

            // Validate modelConcurrency
            if (
              !Number.isInteger(argv.modelConcurrency) ||
              argv.modelConcurrency < 1 ||
              argv.modelConcurrency > 5
            ) {
              errors.push("modelConcurrency must be integer between 1 and 5");
            }

            if (errors.length > 0) {
              throw new Error(errors.join(", "));
            }

            return true;
          });
      },
      async (argv) => {
        try {
          const tasks = argv.task
            ? [argv.task]
            : Object.keys(config.benchmarks[argv.type].tasks);
          const datasets = argv.dataset
            ? argv.dataset
            : [Object.keys(config.benchmarks[argv.type].datasets)[0]];
          const models = argv.model
            ? argv.model
            : config.models.map((m) => m.label);
          const args: RunBenchmarkArgs = {
            type: argv.type,
            task: argv.task ?? tasks[0],
            models: config.models.filter((m) => models.includes(m.label)),
            datasets,
            modelConcurrency: argv.modelConcurrency,
          };
          await runBenchmark(config, args);
        } catch (error) {
          console.error("Error running benchmark:", error);
          process.exit(1);
        }
      }
    )
    .command("list", "List all available benchmarks", () => {
      console.log(
        JSON.stringify(
          Object.entries(config.benchmarks).map(([type, benchmarkConfig]) => ({
            type,
            description: benchmarkConfig.description,
            datasets: Object.entries(benchmarkConfig.datasets)
              .map(([name, dataset]) => ({
                [name]: dataset.description ?? "",
              }))
              .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
            tasks: Object.entries(benchmarkConfig.tasks)
              .map(([name, task]) => ({
                [name]: task.description ?? "",
              }))
              .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
            scorers: Object.entries(benchmarkConfig.scorers)
              .map(([name, scorer]) => ({
                [name]: scorer.description ?? "",
              }))
              .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
          })),
          null,
          2
        )
      );
    })
    .command("models list", "List all available models", () => {
      console.log(
        JSON.stringify(
          config.models.map(
            ({ label, provider, deployment, maxConcurrency }) => ({
              label,
              provider,
              deployment,
              maxConcurrency,
            })
          ),
          null,
          2
        )
      );
    })
    .demandCommand(1, "You need to specify a command")
    .help()
    .alias("h", "help")
    .version("1.0.0")
    .alias("v", "version")
    .scriptName("benchmark");
}
