import assert from "assert";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { NlPromptResponseEvalTask } from "./NlQuestionAnswerEval";
import {
  LanguageModel,
  generateText,
  CoreMessage,
} from "mongodb-rag-core/aiSdk";

interface MakeNlPromptCompletionTaskParams {
  llmOptions: Omit<LlmOptions, "openAiClient" | "model">;
  languageModel: LanguageModel;
  initialMessages?: CoreMessage[];
}

export function makeNlPromptCompletionTask({
  llmOptions,
  languageModel,
  initialMessages,
}: MakeNlPromptCompletionTaskParams): NlPromptResponseEvalTask {
  return async function (input) {
    const { ...llmConfig } = llmOptions;
    const { text } = await generateText({
      messages: [...(initialMessages ?? []), ...input.messages],
      model: languageModel,
      temperature: llmConfig.temperature ?? undefined,
      maxOutputTokens:
        llmConfig.max_completion_tokens ?? llmConfig.max_tokens ?? undefined,
      seed: llmConfig.seed ?? undefined,
    });
    assert(text, "No content found in response");
    return { response: text };
  };
}
