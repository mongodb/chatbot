import type { OpenAI } from "mongodb-rag-core/openai";
import {
  makeClassifier,
  type Classifier,
  type ClassificationType,
} from "mongodb-rag-core";
import type { Logger } from "../logger";

export type MakeClassifierWithLoggingArgs = {
  openAiClient: OpenAI;
  model: string;
  logger?: Logger;
  classificationTypes: ClassificationType[];
  chainOfThought?: boolean;
};

export function makeClassifierWithLogging({
  openAiClient,
  model,
  logger,
  classificationTypes,
  chainOfThought = false,
}: MakeClassifierWithLoggingArgs): Classifier {
  const classify = makeClassifier({
    openAiClient,
    model,
    classificationTypes,
    chainOfThought,
  });

  return async function classifyWithLogging({ input }: { input: string }) {
    await logger?.log("debug", "Classifying input", { input });

    const result = await classify({ input });

    await logger?.log("debug", "Classification result", {
      input,
      classification: result.classification,
      messages: result.inputMessages,
    });

    return result;
  };
}
