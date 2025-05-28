import { BenchmarkConfig } from "../../runNlPromptResponseBenchmark";

const projectName = "top-questions-prompt-completion";

export const topQuestionsConfig: BenchmarkConfig = {
  datasets: [
    {
      projectName,
      datasetName: "top-questions-prompt-completion",
    },
  ],
  projectName,
  experimentBaseName: "top-questions",
};
