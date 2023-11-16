export interface GradeArguments {
  /**
   * The input string to grade.
   */
  input: string;

  /**
   * The criteria to use to grade the input string.
   */
  criteria: string;
}

export interface GradeResult {
  /**
   * The grade of the input string on a scale from [0, 1] where 0.0 is a
   * complete failure and 1.0 is a complete success.
   */
  grade: number;

  /**
   * A list of comments to provide feedback on the input string relative
   * to the provided criteria.
   */
  comments: string[];
}

export interface Grader {
  grade: (args: GradeArguments) => GradeResult;
}

export interface MakeGraderOptions {}

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
