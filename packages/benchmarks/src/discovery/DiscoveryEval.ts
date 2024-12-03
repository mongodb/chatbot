import { strict as assert } from "assert";
import { Eval, EvalCase, EvalScorer, EvalTask } from "braintrust";
import { OpenAI } from "mongodb-rag-core/openai";

export interface DiscoveryEvalCaseInput {
  content: string;
}

export type DiscoveryTag = "top_search_term";

export interface DiscoveryEvalCase
  extends EvalCase<DiscoveryEvalCaseInput, unknown, unknown> {
  tags?: DiscoveryTag[];
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

/**
  Create a scorer that checks if the output strings matches a regular expression.
  The score is the fraction of outputs that match the regular expression.
 */
export function makeMatchScorer(matchRegExp: RegExp): DiscoveryEvalScorer {
  return (args) => {
    const matches: boolean[] = [];
    for (const content of args.output.content) {
      matches.push(matchRegExp.test(content));
    }
    const score =
      matches.reduce((acc, match) => acc + (match ? 1 : 0), 0) / matches.length;
    return {
      name: `Matches_${matchRegExp.source}`,
      score,
      metadata: {
        matches,
      },
    };
  };
}

type DiscoveryLlmOptions = Pick<
  OpenAI.ChatCompletionCreateParams,
  "max_tokens" | "temperature"
>;

export interface MakeDiscoveryEvalParams {
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
  return Eval<DiscoveryEvalCaseInput, DiscoveryTaskOutput>(
    "discovery-benchmark",
    {
      data,
      experimentName,
      maxConcurrency,
      metadata: {
        model,
        llmOptions,
        matchRegExp: matchRegExp.toString(),
        ...additionalMetadata,
      },
      task: makeDiscoveryTask({ openaiClient, llmOptions, model, iterations }),
      scores: [makeMatchScorer(matchRegExp)],
    }
  );
}
