import { BenchmarkConfig } from "../globalConfig";

export const productKnowledgeConfig: BenchmarkConfig = {
  datasetName: "product-knowledge-prompt-completion",
  projectName: "product-knowledge-prompt-completion",
  experimentBaseName: "product-knowledge",
  initialMessages: [
    {
      role: "system",
      content:
        "You are a helpful MongoDB assistant. Answer the user's question directly, informatively, and concisely.",
    },
  ],
};
