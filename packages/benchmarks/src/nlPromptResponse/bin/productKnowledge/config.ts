import { BenchmarkConfig } from "../../runNlPromptResponseBenchmark";

const projectName = "product-knowledge-prompt-completion";

export const productKnowledgeConfig: BenchmarkConfig = {
  datasets: [
    {
      projectName,
      datasetName: "product-knowledge-prompt-completion",
    },
  ],
  projectName,
  experimentBaseName: "product-knowledge",
};
