import {
  TextToDriverEvalScorer,
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./evalTypes";
// evaluationMetrics.test.ts
import {
  QueryRunTimeMs,
  GenerationLength,
  CorrectOutput,
} from "./evaluationMetrics";

const mockOutput = {
  execution: {
    executionTimeMs: 123,
    result: { foo: "bar" },
  },
  generatedCode: "console.log('Hello, world!');",
} satisfies TextToDriverOutput;
const mockInput = "baz" satisfies TextToDriverInput;
const mockExpected = "bash" satisfies TextToDriverExpected;
const mockMetadata = {
  dataset_name: "example",
  sql: {
    query: "SELECT * FROM example",
    tags: {
      category: "SIMPLE_SELECT",
      subcategories: ["AGGREGATION"],
    },
  },
} satisfies TextToDriverMetadata;
const mockArgs = {
  output: mockOutput,
  input: mockInput,
  expected: mockExpected,
  metadata: mockMetadata,
} satisfies Parameters<TextToDriverEvalScorer>[0];

type ExtractArrayType<T> = T extends (infer U)[] ? T : never;
type Scorers = ExtractArrayType<Awaited<ReturnType<TextToDriverEvalScorer>>>;
describe("CorrectOutput", () => {
  it("should return SuccessfulExecution score 1 when execution result is not null", async () => {
    const mockOutput: TextToDriverOutput = {
      execution: {
        executionTimeMs: 123,
        result: [{ id: 1, name: "Alice" }],
      },
      generatedCode: "db.collection.find();",
    };
    const mockArgs = {
      output: mockOutput,
      input: "Find all users",
      expected: JSON.stringify([{ id: 1, name: "Alice" }]),
      metadata: {
        dataset_name: "users",
        sql: {
          query: "SELECT * FROM users",
          tags: {
            category: "SIMPLE_SELECT",
            subcategories: [],
          },
        },
      },
    } satisfies Parameters<TextToDriverEvalScorer>[0];

    const result = await CorrectOutput(mockArgs);

    expect(result).toEqual([
      {
        name: "SuccessfulExecution",
        score: 1,
      },
      {
        name: "CorrectOutputFuzzy",
        score: 1,
      },
    ]);
  });

  it("should return SuccessfulExecution score 0 when execution result is null", async () => {
    const mockOutput: TextToDriverOutput = {
      execution: {
        executionTimeMs: 0,
        result: null,
        error: { message: "Execution failed" },
      },
      generatedCode: "db.collection.find();",
    };
    const mockArgs = {
      output: mockOutput,
      input: "Find all users",
      expected: JSON.stringify([{ id: 1, name: "Alice" }]),
      metadata: {
        dataset_name: "users",
        sql: {
          query: "SELECT * FROM users",
          tags: {
            category: "SIMPLE_SELECT",
            subcategories: [],
          },
        },
      },
    } satisfies Parameters<TextToDriverEvalScorer>[0];

    const result = await CorrectOutput(mockArgs);

    expect(result).toEqual([
      {
        name: "SuccessfulExecution",
        score: 0,
        metadata: {
          error: "Execution failed",
        },
      },
      {
        name: "CorrectOutputFuzzy",
        score: null,
      },
    ]);
  });

  it("should return CorrectOutputFuzzy score 1 when fuzzyMatch returns true", async () => {
    const mockOutput: TextToDriverOutput = {
      execution: {
        executionTimeMs: 123,
        result: [{ id: 1, name: "Alice" }],
      },
      generatedCode: "db.collection.find();",
    };
    const mockArgs = {
      output: mockOutput,
      input: "Find all users",
      expected: JSON.stringify([{ id: 1, name: "Alice" }]),
      metadata: {
        dataset_name: "users",
        sql: {
          query: "SELECT * FROM users",
          tags: {
            category: "SIMPLE_SELECT",
            subcategories: [],
          },
        },
      },
    } satisfies Parameters<TextToDriverEvalScorer>[0];

    const result = (await CorrectOutput(mockArgs)) as Scorers;

    expect(result[1]).toEqual({
      name: "CorrectOutputFuzzy",
      score: 1,
    });
  });

  it("should return CorrectOutputFuzzy score 0 when fuzzyMatch returns false", async () => {
    const mockOutput: TextToDriverOutput = {
      execution: {
        executionTimeMs: 123,
        result: [{ id: 1, name: "Bob" }],
      },
      generatedCode: "db.collection.find();",
    };
    const mockArgs = {
      output: mockOutput,
      input: "Find all users",
      expected: JSON.stringify([{ id: 1, name: "Alice" }]),
      metadata: {
        dataset_name: "users",
        sql: {
          query: "SELECT * FROM users",
          tags: {
            category: "SIMPLE_SELECT",
            subcategories: [],
          },
        },
      },
    } satisfies Parameters<TextToDriverEvalScorer>[0];

    const result = (await CorrectOutput(mockArgs)) as Scorers;

    expect(result[1]).toEqual({
      name: "CorrectOutputFuzzy",
      score: 0,
    });
  });

  it("should handle exceptions in fuzzyMatch and set score to null with error metadata", async () => {
    const mockOutput: TextToDriverOutput = {
      execution: {
        executionTimeMs: 123,
        result: [{ id: 1, name: "Alice" }],
      },
      generatedCode: "db.collection.find();",
    };
    const mockArgs = {
      output: mockOutput,
      input: "Find all users",
      expected: "Invalid JSON", // This will cause EJSON.parse to throw an error
      metadata: {
        dataset_name: "users",
        sql: {
          query: "SELECT * FROM users",
          tags: {
            category: "SIMPLE_SELECT",
            subcategories: [],
          },
        },
      },
    } satisfies Parameters<TextToDriverEvalScorer>[0];

    const result = (await CorrectOutput(mockArgs)) as ExtractArrayType<
      Awaited<ReturnType<TextToDriverEvalScorer>>
    >;
    expect(result[1].name).toBe("CorrectOutputFuzzy");
    expect(result[1].score).toBe(null);
    expect(result[1].metadata).toHaveProperty("error");
    expect(result[1]?.metadata?.error).toBeInstanceOf(Error);
  });
});

describe("QueryRunTimeMs", () => {
  it("should return the correct score for execution time", () => {
    const result = QueryRunTimeMs(mockArgs);
    expect(result).toEqual({
      name: "QueryRunTimeMs",
      score: mockOutput.execution.executionTimeMs,
    });
  });
});

describe("GenerationLength", () => {
  it("should return the correct score for generated code length", () => {
    const result = GenerationLength(mockArgs);
    expect(result).toEqual({
      name: "GenerationLength",
      score: mockOutput.generatedCode.length,
    });
  });
});
