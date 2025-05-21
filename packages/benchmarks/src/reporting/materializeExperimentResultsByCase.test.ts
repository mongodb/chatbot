import {
  materializeExperimentResultsByCase,
  providerFromModel,
} from "./materializeExperimentResultsByCase";
import { ResultsByExperiment } from "./reportBenchmarkResults";
import { ExperimentResult } from "./getBraintrustExperimentResults";
import {
  NlPromptResponseEvalCase,
  NlPromptResponseTaskOutput,
} from "../nlPromptResponse/NlQuestionAnswerEval";

describe("materializeExperimentResultsByCase", () => {
  // Create valid ObjectId hex strings (24 characters)
  const mockId1 = "123";
  const mockId2 = "456";

  const mockInput1Text = "test input 1";
  const mockInput2Text = "test input 2";

  // Create mock experiment results
  const mockResultsByExperiment: ResultsByExperiment<
    ExperimentResult<
      NlPromptResponseEvalCase,
      NlPromptResponseTaskOutput,
      string[]
    >
  > = {
    experiment1: {
      metadata: {
        id: "experiment1",
        project_id: "project1",
        name: "experiment1",
        public: false,
      },
      results: [
        {
          id: mockId1,
          input: {
            messages: [
              {
                role: "user",
                content: mockInput1Text,
              },
            ],
          },
          expected: {
            reference: "expected output 1",
            links: [],
          },
          tags: ["tag1", "tag2"],
          output: {
            response: "actual output 1",
          },
          metadata: {
            model: "model1",
          },
          scores: {
            accuracy: 0.8,
            relevance: 0.9,
          },
        },
        {
          id: mockId2,
          input: {
            messages: [
              {
                role: "user",
                content: mockInput2Text,
              },
            ],
          },
          expected: {
            reference: "expected output 2",
            links: [],
          },
          tags: ["tag2", "tag3"],
          output: {
            response: "actual output 2",
          },
          metadata: {
            model: "model2",
          },
          scores: {
            accuracy: 0.7,
            relevance: 0.85,
          },
        },
      ],
    },
    experiment2: {
      metadata: {
        id: "experiment2",
        project_id: "project1",
        name: "experiment2",
        public: false,
      },
      results: [
        {
          id: mockId1,
          input: {
            messages: [
              {
                role: "user",
                content: mockInput1Text,
              },
            ],
          },
          expected: {
            reference: "expected output 1",
            links: [],
          },
          tags: ["tag1", "tag2"],
          output: {
            response: "different output for experiment 2",
          },
          metadata: {
            model: "model2",
          },
          scores: {
            accuracy: 0.75,
            relevance: 0.95,
          },
        },
        {
          id: mockId2,
          input: {
            messages: [
              {
                role: "user",
                content: mockInput2Text,
              },
            ],
          },
          expected: {
            reference: "expected output 2",
            links: [],
          },
          tags: ["tag2", "tag3"],
          output: {
            response: "different output for experiment 2",
          },
          metadata: {
            model: "model2",
          },
          scores: {
            accuracy: 0.65,
            relevance: 0.8,
          },
        },
      ],
    },
  };

  describe("prompt_response type", () => {
    it("should group results by case id", () => {
      const results = materializeExperimentResultsByCase(
        mockResultsByExperiment,
        "prompt_response"
      );

      // Should return the correct number of cases
      expect(results.length).toBe(2);

      // Find the cases by id
      const case1 = results.find((c) => c.name === mockInput1Text);
      const case2 = results.find((c) => c.name === mockInput2Text);

      // Verify both cases exist
      expect(case1).toBeDefined();
      expect(case2).toBeDefined();

      // Verify case1 has results from both experiments
      expect(Object.keys(case1!.results)).toHaveLength(2);
      expect(case1!.results).toHaveProperty("experiment1");
      expect(case1!.results).toHaveProperty("experiment2");

      // Verify case2 has results from both experiments
      expect(Object.keys(case2!.results)).toHaveLength(2);
      expect(case2!.results).toHaveProperty("experiment1");
      expect(case2!.results).toHaveProperty("experiment2");
    });

    it("should correctly map experiment outputs to case results", () => {
      const results = materializeExperimentResultsByCase(
        mockResultsByExperiment,
        "prompt_response"
      );

      // Find the cases by id
      const case1 = results.find((c) => c.name === mockInput1Text);

      // Verify experiment1 results for case1
      expect(case1!.results.experiment1.model).toBe("experiment1");
      expect(case1!.results.experiment1.response).toBe("actual output 1");
      expect(case1!.results.experiment1.metrics).toEqual({
        accuracy: 0.8,
        relevance: 0.9,
      });

      // Verify experiment2 results for case1
      expect(case1!.results.experiment2.model).toBe("experiment2");
      expect(case1!.results.experiment2.response).toBe(
        "different output for experiment 2"
      );
      expect(case1!.results.experiment2.metrics).toEqual({
        accuracy: 0.75,
        relevance: 0.95,
      });
    });

    it("should correctly handle scores", () => {
      const results = materializeExperimentResultsByCase(
        mockResultsByExperiment,
        "prompt_response"
      );

      // Find the cases by id
      const case2 = results.find((c) => c.name === mockInput2Text);

      // Check metrics are correctly extracted from scores
      expect(case2!.results.experiment1.metrics).toEqual({
        accuracy: 0.7,
        relevance: 0.85,
      });

      expect(case2!.results.experiment2.metrics).toEqual({
        accuracy: 0.65,
        relevance: 0.8,
      });
    });
  });
  it("should throw for unsupported experiment types", () => {
    const multipleChoiceType = "multiple_choice";
    expect(() =>
      materializeExperimentResultsByCase(
        mockResultsByExperiment,
        multipleChoiceType
      )
    ).toThrow(`Unsupported experiment type: ${multipleChoiceType}`);
    const naturalLanguageToCodeType = "natural_language_to_code";
    expect(() =>
      materializeExperimentResultsByCase(
        mockResultsByExperiment,
        naturalLanguageToCodeType
      )
    ).toThrow(`Unsupported experiment type: ${naturalLanguageToCodeType}`);
  });
});

describe("providerFromModel", () => {
  it("returns the correct provider for OpenAI models", () => {
    expect(providerFromModel("gpt-4o")).toBe("OpenAI");
    expect(providerFromModel("gpt-4o-mini")).toBe("OpenAI");
    expect(providerFromModel("o3-mini")).toBe("OpenAI");
    expect(providerFromModel("o3-mini-high")).toBe("OpenAI");
    expect(providerFromModel("o3")).toBe("OpenAI");
    expect(providerFromModel("o4-mini")).toBe("OpenAI");
    expect(providerFromModel("gpt-4.1")).toBe("OpenAI");
    expect(providerFromModel("gpt-4.1-mini")).toBe("OpenAI");
    expect(providerFromModel("gpt-4.1-nano")).toBe("OpenAI");
    expect(providerFromModel("gpt-35-turbo-16k")).toBe("OpenAI");
  });
  it("returns the correct provider for Anthropic models", () => {
    expect(providerFromModel("claude-3-sonnet")).toBe("Anthropic");
    expect(providerFromModel("claude-3-haiku")).toBe("Anthropic");
    expect(providerFromModel("claude-35-sonnet")).toBe("Anthropic");
    expect(providerFromModel("claude-35-sonnet-v2")).toBe("Anthropic");
    expect(providerFromModel("claude-37-sonnet")).toBe("Anthropic");
    expect(providerFromModel("claude-35-haiku")).toBe("Anthropic");
  });
  it("returns the correct provider for Meta models", () => {
    expect(providerFromModel("llama-3-70b")).toBe("Meta");
    expect(providerFromModel("llama-3.1-70b")).toBe("Meta");
    expect(providerFromModel("llama-3.2-90b")).toBe("Meta");
    expect(providerFromModel("llama-3.3-70b")).toBe("Meta");
  });
  it("returns the correct provider for Mistral models", () => {
    expect(providerFromModel("mistral-large-2")).toBe("Mistral");
    expect(providerFromModel("mistral-small-3-instruct")).toBe("Mistral");
  });
  it("returns the correct provider for Amazon models", () => {
    expect(providerFromModel("nova-lite-v1:0")).toBe("Amazon");
    expect(providerFromModel("nova-micro-v1:0")).toBe("Amazon");
    expect(providerFromModel("nova-pro-v1:0")).toBe("Amazon");
  });
  it("returns the correct provider for Google models", () => {
    expect(providerFromModel("gemini-1.5-flash-002")).toBe("Google");
    expect(providerFromModel("gemini-2-flash")).toBe("Google");
    expect(providerFromModel("gemini-2.5-flash")).toBe("Google");
    expect(providerFromModel("gemini-2.0-flash-lite")).toBe("Google");
    expect(providerFromModel("gemini-2.5-pro-preview-03-25")).toBe("Google");
    expect(providerFromModel("gemini-1.0-pro-002")).toBe("Google");
    expect(providerFromModel("gemini-1.5-pro-002")).toBe("Google");
  });
  it("returns the correct provider for DeepSeek models", () => {
    expect(providerFromModel("deepseek-coder")).toBe("DeepSeek");
    expect(providerFromModel("deepseek-r1")).toBe("DeepSeek");
  });
  it("returns the correct provider for Alibaba models", () => {
    expect(providerFromModel("qwen-2.5-72b-instruct")).toBe("Alibaba");
  });
});
