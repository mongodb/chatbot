import assert from "assert";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { NlPromptResponseEvalTask } from "./NlQuestionAnswerEval";

interface MakeNlPromptCompletionTaskParams {
  llmOptions: LlmOptions;
}

export function makeNlPromptCompletionTask({
  llmOptions,
}: MakeNlPromptCompletionTaskParams): NlPromptResponseEvalTask {
  return async function (input) {
    const res = await llmOptions.openAiClient.chat.completions.create({
      messages: input.messages,
      stream: false,
      ...llmOptions,
    });
    const { content } = res.choices[0].message;
    assert(content, "No content found in response");
    return { response: content };
  };
}
