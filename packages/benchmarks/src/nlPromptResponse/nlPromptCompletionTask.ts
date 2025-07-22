import assert from "assert";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { NlPromptResponseEvalTask } from "./NlQuestionAnswerEval";
import { OpenAI } from "mongodb-rag-core/openai";

interface MakeNlPromptCompletionTaskParams {
  openAiClient: OpenAI;
  llmOptions: LlmOptions;
  initialMessages?: OpenAI.Chat.ChatCompletionMessageParam[];
}

export function makeNlPromptCompletionTask({
  openAiClient,
  llmOptions,
  initialMessages,
}: MakeNlPromptCompletionTaskParams): NlPromptResponseEvalTask {
  return async function (input) {
    const { ...llmConfig } = llmOptions;
    const res = await openAiClient.chat.completions.create({
      messages: [...(initialMessages ?? []), ...input.messages],
      stream: false,
      ...llmConfig,
    });
    const { content } = res.choices[0].message;
    assert(content, "No content found in response");
    return { response: content };
  };
}
