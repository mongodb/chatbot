import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./evalTypes";
// evaluationMetrics.test.ts
import { QueryRunTimeMs, GenerationLength } from "./evaluationMetrics";

describe("QueryOutput", () => {
  // TODO: couple of cases here to cover the different scenarios
});

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
};
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
