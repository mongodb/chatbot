import { BenchmarkConfig } from "../../runNlPromptResponseBenchmark";

const projectName = "marketing-prompt-completion";

export const marketingConfig: BenchmarkConfig = {
  datasets: [
    {
      projectName,
      datasetName: "marketing-prompt-completion",
    },
  ],
  projectName,
  experimentBaseName: "marketing",
};
