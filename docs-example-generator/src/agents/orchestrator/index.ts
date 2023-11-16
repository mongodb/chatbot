export interface OrchestrateArguments {}

export interface Orchestrator {
  run: (args: OrchestrateArguments) => string;
}

export interface MakeOrchestratorOptions {}

export function makeGrader(options: MakeGraderOptions = {}): Grader {
  return {
    grade(args) {
      // TODO: Actually grade the input
      return {
        grade: 0.67,
        comments: [
          "This is a comment.",
          "This is another comment.",
          "This is a third comment.",
        ],
      };
    },
  };
}
