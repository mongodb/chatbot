import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./evalTypes";
import {
  QueryExecutionTimeMinutes,
  SuccessfulExecution,
} from "./evaluationMetrics";

const input = {
  dataset_name: "some dataset",
  nl_query: "some query",
} satisfies TextToDriverInput;
const expected = "" satisfies TextToDriverExpected;
const metadata = {
  sql: {
    query: "some query",
    tags: {
      category: "COMPLEX_SELECT",
      subcategories: ["JOIN"],
    },
  },
} satisfies TextToDriverMetadata;

describe("SuccessfulExecution", () => {
  it("should return score 0 when execution result is null", async () => {
    const output = {
      execution: {
        result: null,
        executionTimeMs: 1,
      },
      generatedCode: "some code",
    } satisfies TextToDriverOutput;
    const result = await SuccessfulExecution({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toEqual({
      name: "SuccessfulExecution",
      score: 0,
    });
  });

  it("should return score 1 when execution result is not null", async () => {
    const output = {
      execution: {
        result: {},
        executionTimeMs: 1,
      },
      generatedCode: "some code",
    } satisfies TextToDriverOutput;
    const result = await SuccessfulExecution({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toEqual({
      name: "SuccessfulExecution",
      score: 1,
    });
  });

  it("should include error metadata when execution error is present", async () => {
    const error = {
      message: "some error",
    };
    const output = {
      execution: {
        result: null,
        executionTimeMs: 1,
        error,
      },
      generatedCode: "some code",
    } satisfies TextToDriverOutput;
    const result = await SuccessfulExecution({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toEqual({
      name: "SuccessfulExecution",
      score: 1,
      metadata: error,
    });
  });
});

describe("QueryExecutionTimeMinutes", () => {
  it("should correctly convert execution time from ms to minutes", async () => {
    const output = {
      execution: {
        result: null,
        executionTimeMs: 500,
      },
      generatedCode: "some code",
    } satisfies TextToDriverOutput;
    const result = await QueryExecutionTimeMinutes({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toEqual({
      name: "QueryExecutionTimeMinutes",
      score: output.execution.executionTimeMs / 60,
    });
  });
});
