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
const expectedObj = [{ count: 1 }];
const expected = JSON.stringify(expectedObj) satisfies TextToDriverExpected;
const metadata = {
  sql: {
    query: "some query",
    tags: {
      category: "COMPLEX_SELECT",
      subcategories: ["JOIN"],
    },
  },
} satisfies TextToDriverMetadata;
const generatedCode = "some code";

describe("SuccessfulExecution", () => {
  it("should return score 0 when execution result is null", async () => {
    const output = {
      execution: {
        result: null,
        executionTimeMs: 1,
      },
      generatedCode,
    } satisfies TextToDriverOutput;
    const result = await SuccessfulExecution({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toMatchObject([
      { name: "SuccessfulExecution", score: 0 },
      {
        metadata: { error: "Fuzzy match failed" },
        name: "CorrectOutputFuzzy",
        score: 0,
      },
    ]);
  });

  it("should return score 1 for both metrics when execution result is fuzzy match", async () => {
    const output = {
      execution: {
        result: expectedObj,
        executionTimeMs: 1,
      },
      generatedCode,
    } satisfies TextToDriverOutput;
    const result = await SuccessfulExecution({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toEqual([
      {
        name: "SuccessfulExecution",
        score: 1,
      },
      { name: "CorrectOutputFuzzy", score: 1 },
    ]);
  });
  it("should return SuccessfulExecution: 1 and FuzzyMatch: 0 when execution succeeds but is not a fuzzy match", async () => {
    const realDifferentFromExpected = [{ foo: 5 }];
    const output = {
      execution: {
        result: realDifferentFromExpected,
        executionTimeMs: 1,
      },
      generatedCode,
    } satisfies TextToDriverOutput;
    const result = await SuccessfulExecution({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toEqual([
      { name: "SuccessfulExecution", score: 1 },
      { name: "CorrectOutputFuzzy", score: 0 },
    ]);
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
      generatedCode,
    } satisfies TextToDriverOutput;
    const result = await SuccessfulExecution({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toEqual([
      { name: "SuccessfulExecution", score: 0 },
      {
        metadata: { error: "Fuzzy match failed" },
        name: "CorrectOutputFuzzy",
        score: 0,
      },
    ]);
  });
});

describe("QueryExecutionTimeMinutes", () => {
  it("should correctly convert execution time from ms to minutes", async () => {
    const output = {
      execution: {
        result: null,
        executionTimeMs: 500,
      },
      generatedCode,
    } satisfies TextToDriverOutput;
    const result = await QueryExecutionTimeMinutes({
      output,
      input,
      expected,
      metadata,
    });
    expect(result).toEqual({
      name: "QueryExecutionTimeMinutes",
      score: output.execution.executionTimeMs / 1000 / 60,
    });
  });
});
