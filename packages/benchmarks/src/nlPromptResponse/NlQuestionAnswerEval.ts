import { EvalCase, EvalScorer, EvalTask } from "mongodb-rag-core/braintrust";
import { ConversationEvalCase } from "mongodb-rag-core/eval";
import { LlmOptions } from "mongodb-rag-core/executeCode";

export type NlPromptResponseEvalCaseInput = {
  messages: ConversationEvalCase["messages"];
};

export type NlPromptResponseTag = string;

export type NlPromptResponseMetadata = Record<string, unknown> &
  Partial<Omit<LlmOptions, "openAiClient">>;

export interface NlPromptResponseEvalCase
  extends EvalCase<
    NlPromptResponseEvalCaseInput,
    NlPromptResponseTaskExpected,
    NlPromptResponseMetadata
  > {
  tags: NlPromptResponseTag[];
}

export type NlPromptResponseTaskOutput = {
  response: string;
  links?: string[];
};

export type NlPromptResponseTaskExpected = {
  reference: ConversationEvalCase["reference"];
  links: ConversationEvalCase["expectedLinks"];
};

export type NlPromptResponseEvalTask = EvalTask<
  NlPromptResponseEvalCaseInput,
  NlPromptResponseTaskOutput,
  NlPromptResponseTaskExpected,
  NlPromptResponseMetadata
>;

export type NlPromptResponseEvalScorer = EvalScorer<
  NlPromptResponseEvalCaseInput,
  NlPromptResponseTaskOutput,
  NlPromptResponseTaskExpected,
  NlPromptResponseMetadata
>;
<<<<<<< HEAD
=======

export interface RunNlPromptResponseEvalParams {
  data: NlPromptResponseEvalCase[];
  projectName: string;
  experimentName: string;
  additionalMetadata?: Record<string, unknown>;
  maxConcurrency?: number;
  task: NlPromptResponseEvalTask;
  scorers: NlPromptResponseEvalScorer[];
}

export function runNlPromptResponseEval({
  data,
  projectName,
  experimentName,
  additionalMetadata,
  task,
  maxConcurrency,
  scorers,
}: RunNlPromptResponseEvalParams) {
  return Eval<
    NlPromptResponseEvalCaseInput,
    NlPromptResponseTaskOutput,
    NlPromptResponseTaskExpected,
    NlPromptResponseMetadata
  >(projectName, {
    data,
    experimentName,
    maxConcurrency,
    metadata: additionalMetadata,
    task,
    scores: scorers,
  });
}
>>>>>>> upstream/main
