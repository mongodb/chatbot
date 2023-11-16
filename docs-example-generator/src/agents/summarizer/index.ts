export interface SummarizeArguments {
  /**
   * The input string to summarize.
   */
  input: string;
}

export interface Summarizer {
  /**
   * Summarizes a provided input.
   */
  summarize(args: SummarizeArguments): string;
}

export interface MakeSummarizerOptions {}

export function makeSummarizer(options: MakeSummarizerOptions = {}): Summarizer {
  return {
    summarize(args) {
      // TODO: Actually summarize the input
      return args.input;
    }
  };
}
