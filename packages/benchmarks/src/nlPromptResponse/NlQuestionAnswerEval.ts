import {
  Eval,
  EvalCase,
  EvalScorer,
  EvalTask,
} from "mongodb-rag-core/braintrust";
import { ConversationEvalCase } from "mongodb-rag-core/eval";

export type NlPromptResponseEvalCaseInput = {
  messages: ConversationEvalCase["messages"];
};

export type NlPromptResponseTag = string;

export type NlPromptResponseMetadata = Record<string, unknown>;

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
  NlPromptResponseTaskExpected
>;

export type NlPromptResponseEvalScorer = EvalScorer<
  NlPromptResponseEvalCaseInput,
  NlPromptResponseTaskOutput,
  NlPromptResponseTaskExpected,
  void
>;

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
    NlPromptResponseTaskExpected
  >(projectName, {
    data,
    experimentName,
    maxConcurrency,
    metadata: additionalMetadata,
    task,
    scores: scorers,
  });
}
