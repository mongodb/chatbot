import { strict as assert } from "assert";
import {
  Eval,
  EvalCase,
  EvalScorer,
  EvalTask,
} from "mongodb-rag-core/braintrust";
import { OpenAI } from "mongodb-rag-core/openai";
import fs from "fs";
import { getConversationsEvalCasesFromYaml } from "mongodb-rag-core/eval";

export interface DiscoveryEvalCaseInput {
  content: string;
}

export type DiscoveryTag =
  | "discovery"
  | "marketing"
  | "atlas_vector_search"
  | "competition"
  | "vector_search";

export interface DiscoveryEvalCase
  extends EvalCase<DiscoveryEvalCaseInput, void, void> {
  tags?: DiscoveryTag[];
}

export function getDiscoveryConversationEvalDataFromYamlFile(
  filePath: string
): DiscoveryEvalCase[] {
  const conversations = getConversationsEvalCasesFromYaml(
    fs.readFileSync(filePath, "utf8")
  );
  return conversations.map((evalCase) => {
    const latestMessageText =
      evalCase.messages[evalCase.messages.length - 1].content;
    assert(latestMessageText, "No latest message text found");
    return {
      tags: evalCase.tags as DiscoveryTag[],
      input: {
        content: latestMessageText,
      },
    };
  });
}

export interface DiscoveryTaskOutput {
  content: string[];
}

export type DiscoveryEvalTask = EvalTask<
  DiscoveryEvalCaseInput,
  DiscoveryTaskOutput
>;

interface MakeDiscoveryTaskParams {
  openaiClient: OpenAI;
  llmOptions: DiscoveryLlmOptions;
  model: string;
  iterations: number;
}
function makeDiscoveryTask({
  openaiClient,
  model,
  llmOptions,
  iterations,
}: MakeDiscoveryTaskParams): DiscoveryEvalTask {
  return async function (input) {
    const contentOut = [];
    for (let i = 0; i < iterations; i++) {
      const res = await openaiClient.chat.completions.create({
        model,
        messages: [{ role: "user", content: input.content }],
        stream: false,
        ...llmOptions,
        seed: 42, // Deterministically sample from the model, so same output every time
      });
      const { content } = res.choices[0].message;
      assert(content, "No content found in response");
      contentOut.push(content);
    }
    return {
      content: contentOut,
    };
  };
}

export type DiscoveryEvalScorer = EvalScorer<
  DiscoveryEvalCaseInput,
  DiscoveryTaskOutput,
  void,
  void
>;

export function makeMatchScorers(matchRegExp: RegExp): DiscoveryEvalScorer {
  return (args) => {
    const matches: boolean[] = [];
    for (const content of args.output.content) {
      matches.push(matchRegExp.test(content));
    }
    const score =
      matches.reduce((acc, match) => acc + (match ? 1 : 0), 0) / matches.length;
    return [
      {
        name: `Matches_${matchRegExp.source}`,
        score,
        metadata: {
          matches,
          description: "Fraction of outputs that match the regular expression",
        },
      },
      {
        name: `SomeMatches_${matchRegExp.source}`,
        score: score > 0 ? 1 : 0,
        metadata: {
          matches,
          description:
            "Whether at least one output matches the regular expression",
        },
      },
    ];
  };
}

type DiscoveryLlmOptions = Pick<
  OpenAI.ChatCompletionCreateParams,
  "max_tokens" | "temperature"
>;

export interface MakeDiscoveryEvalParams {
  projectName: string;
  data: DiscoveryEvalCase[];
  openaiClient: OpenAI;
  matchRegExp: RegExp;
  experimentName: string;
  llmOptions: DiscoveryLlmOptions;
  additionalMetadata?: Record<string, unknown>;
  model: string;
  iterations?: number;
  maxConcurrency?: number;
}

export function runDiscoveryEval({
  projectName,
  data,
  openaiClient,
  matchRegExp,
  experimentName,
  additionalMetadata,
  llmOptions,
  model,
  iterations = 1,
  maxConcurrency,
}: MakeDiscoveryEvalParams) {
  return Eval<DiscoveryEvalCaseInput, DiscoveryTaskOutput>(projectName, {
    data,
    experimentName,
    maxConcurrency,
    metadata: {
      model,
      llmOptions,
      iterations,
      matchRegExp: matchRegExp.toString(),
      ...additionalMetadata,
    },
    task: makeDiscoveryTask({ openaiClient, llmOptions, model, iterations }),
    scores: [makeMatchScorers(matchRegExp)],
  });
}
