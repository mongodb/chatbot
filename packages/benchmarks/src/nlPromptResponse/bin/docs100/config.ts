import { BenchmarkConfig } from "../globalConfig";

export const docs100Config: BenchmarkConfig = {
  datasetName: "docs-100-prompt-completion",
  projectName: "docs-100-prompt-completion",
  experimentBaseName: "docs-100",
  initialMessages: [
    {
      role: "system",
      content:
        "You are a helpful MongoDB assistant. Answer the user's question directly, informatively, and concisely.",
    },
  ],
};
