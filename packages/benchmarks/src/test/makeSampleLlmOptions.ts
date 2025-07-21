import { LlmOptions } from "mongodb-rag-core/executeCode";

export const makeSampleLlmOptions = () => {
  return {
    model: "gpt-4o",
    temperature: 0,
  } satisfies LlmOptions;
};
