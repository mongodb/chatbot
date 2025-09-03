import { type MercuryPrompt } from "./database";
import util from "util";
import {
  NlPromptResponseEvalCaseInput,
  NlPromptResponseMetadata,
  NlPromptResponseTaskExpected,
  NlPromptResponseTaskOutput,
} from "../../../benchmarks/build/nlPromptResponse/NlQuestionAnswerEval";

function handleUnknownError(error: unknown): string {
  const e = error instanceof Error ? error : new Error(String(error));
  return util.inspect(e);
}

export class GenerationFailedError extends Error {
  public readonly prompt;
  public readonly model;
  public readonly error: string;

  constructor(args: { prompt: MercuryPrompt; model: string; error: unknown }) {
    super(
      `Generation failed for prompt ${args.prompt._id} and model ${args.model}`
    );
    this.name = "GenerationFailedError";
    this.prompt = args.prompt;
    this.model = args.model;
    this.error = handleUnknownError(args.error);
  }
}

export class ScoringFailedError extends Error {
  public readonly prompt;
  public readonly model;
  public readonly scorer: {
    input: NlPromptResponseEvalCaseInput;
    output: NlPromptResponseTaskOutput;
    expected: NlPromptResponseTaskExpected;
    metadata: NlPromptResponseMetadata;
  };
  public readonly error: string;

  constructor(args: {
    prompt: MercuryPrompt;
    model: string;
    scorer: {
      input: NlPromptResponseEvalCaseInput;
      output: NlPromptResponseTaskOutput;
      expected: NlPromptResponseTaskExpected;
      metadata: NlPromptResponseMetadata;
    };
    error: unknown;
  }) {
    super(
      `Scoring failed for prompt ${args.prompt._id} and model ${args.model}`
    );
    this.name = "ScoringFailedError";
    this.prompt = args.prompt;
    this.model = args.model;
    this.scorer = args.scorer;
    this.error = handleUnknownError(args.error);
  }
}

export class MongoWriteError extends Error {
  public readonly error;
  public readonly ns;
  public readonly metadata: Record<string, unknown>;

  constructor(args: {
    error: unknown;
    ns: { db: string; collection: string };
    metadata?: Record<string, unknown>;
  }) {
    super(`MongoDB write error`);
    this.name = "MongoWriteError";
    this.error = handleUnknownError(args.error);
    this.ns = args.ns;
    this.metadata = args.metadata ?? {};
  }
}
