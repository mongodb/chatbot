import { BenchmarkConfig } from "../../runNlPromptResponseBenchmark";

const projectName = "tech-support-prompt-completion";

export const techSupportConfig: BenchmarkConfig = {
  datasets: [
    {
      projectName,
      datasetName: "tech-support-q-and-a-verified-tagged",
    },
  ],
  projectName,
  experimentBaseName: "tech-support",
};
