import { BenchmarkConfig } from "../../runNlPromptResponseBenchmark";

const projectName = "docs-100-prompt-completion";

export const docs100Config: BenchmarkConfig = {
  datasets: [
    {
      projectName,
      datasetName: "docs-100-prompt-completion",
    },
  ],
  projectName,
  experimentBaseName: "docs-100",
};
