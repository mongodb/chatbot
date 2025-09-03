import { type MercuryPrompt } from "./database";
import util from "util";
import {
  NlPromptResponseEvalCaseInput,
  NlPromptResponseMetadata,
  NlPromptResponseTaskExpected,
  NlPromptResponseTaskOutput,
} from "../../../benchmarks/build/nlPromptResponse/NlQuestionAnswerEval";

export class GenerationFailedError extends Error {
  public readonly prompt;
  public readonly model;
  public readonly error;

  constructor(args: { prompt: MercuryPrompt; model: string; error: Error }) {
    super(
      `Generation failed for prompt ${args.prompt._id} and model ${args.model}`
    );
    this.name = "GenerationFailedError";
    this.prompt = args.prompt;
    this.model = args.model;
    this.error = args.error;
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
    error: Error;
  }) {
    super(
      `Scoring failed for prompt ${args.prompt._id} and model ${args.model}`
    );
    this.name = "ScoringFailedError";
    this.prompt = args.prompt;
    this.model = args.model;
    this.scorer = args.scorer;
    this.error = util.inspect(args.error);
  }
}
