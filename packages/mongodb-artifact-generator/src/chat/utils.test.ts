import { formatFewShotExamples } from "./utils";
import { z } from "zod";

describe("formatFewShotExamples", () => {
  test("formats few shot examples into an LLM conversation", () => {
    const result = formatFewShotExamples({
      examples: [
        ["input1", "output1"],
        ["input2", "output2"],
      ],
      responseSchema: z.string(),
      functionName: "test-few-shot-function",
    });
    expect(result).toEqual([
      { role: "user", content: "input1" },
      {
        role: "assistant",
        content: null,
        function_call: {
          name: "test-few-shot-function",
          arguments: JSON.stringify("output1"),
        },
      },
      { role: "user", content: "input2" },
      {
        role: "assistant",
        content: null,
        function_call: {
          name: "test-few-shot-function",
          arguments: JSON.stringify("output2"),
        },
      },
    ]);
  });

  test("allows you to pass objects as output", () => {
    const result = formatFewShotExamples({
      examples: [
        ["input1", { key: "value1" }],
        ["input2", { key: "value2" }],
      ],
      responseSchema: z.object({ key: z.string() }),
      functionName: "test-few-shot-function",
    });
    expect(result).toEqual([
      { role: "user", content: "input1" },
      {
        role: "assistant",
        content: null,
        function_call: {
          name: "test-few-shot-function",
          arguments: JSON.stringify({ key: "value1" }),
        },
      },
      { role: "user", content: "input2" },
      {
        role: "assistant",
        content: null,
        function_call: {
          name: "test-few-shot-function",
          arguments: JSON.stringify({ key: "value2" }),
        },
      },
    ]);
  });
});
