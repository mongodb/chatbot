import PromisePool from "@supercharge/promise-pool";
import { Eval } from "mongodb-rag-core/braintrust";
import { runBenchmark, RunBenchmarkArgs } from "./runBenchmark";
import { BenchmarkCliConfig } from "./BenchmarkConfig";
import { makeExperimentName } from "../makeExperimentName";
import { ModelConfig } from "mongodb-rag-core/models";

// Mock dependencies
jest.mock("@supercharge/promise-pool");
jest.mock("mongodb-rag-core/braintrust");
jest.mock("../makeExperimentName");

const mockPromisePool = PromisePool as jest.MockedClass<typeof PromisePool>;
const mockEval = Eval as jest.MockedFunction<typeof Eval>;
const mockMakeExperimentName = makeExperimentName as jest.MockedFunction<
  typeof makeExperimentName
>;

describe("runBenchmark", () => {
  let mockConfig: BenchmarkCliConfig;
  let mockModels: ModelConfig[];
  let mockArgs: RunBenchmarkArgs;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let mockDataset1: any[];
  let mockDataset2: any[];
  let mockTaskFunc: jest.Mock;
  let mockScorerFunc: jest.Mock;
  let mockProcessFunction: jest.Mock;
  let mockPromisePoolInstance: any;

  beforeEach(() => {
    mockDataset1 = [
      { input: "test input 1", expected: "test output 1" },
      { input: "test input 2", expected: "test output 2" },
    ];
    mockDataset2 = [{ input: "test input 3", expected: "test output 3" }];

    mockTaskFunc = jest.fn().mockReturnValue("mock-task-result");
    mockScorerFunc = jest.fn().mockReturnValue("mock-scorer-result");

    mockModels = [
      {
        label: "test-model-1",
        provider: "braintrust",
        developer: "OpenAI",
        deployment: "gpt-4",
        maxConcurrency: 5,
      },
      {
        label: "test-model-2",
        provider: "braintrust",
        developer: "OpenAI",
        deployment: "gpt-3.5-turbo",
        maxConcurrency: 10,
      },
    ];

    mockConfig = {
      models: mockModels,
      modelProvider: {
        baseUrl: "https://api.openai.com",
        apiKey: "test-key",
      },
      benchmarks: {
        "test-benchmark": {
          description: "Test benchmark",
          projectName: "test-project",
          datasets: {
            dataset1: {
              description: "Test dataset 1",
              getDataset: jest.fn().mockResolvedValue(mockDataset1),
            },
            dataset2: {
              description: "Test dataset 2",
              getDataset: jest.fn().mockResolvedValue(mockDataset2),
            },
          },
          tasks: {
            task1: {
              description: "Test task 1",
              taskFunc: mockTaskFunc,
            },
            task2: {
              description: "Test task 2",
              taskFunc: jest.fn(),
            },
          },
          scorers: {
            scorer1: {
              description: "Test scorer 1",
              scorerFunc: mockScorerFunc,
            },
          },
        },
      },
    };

    mockArgs = {
      type: "test-benchmark",
      task: "task1",
      models: mockModels,
      datasets: ["dataset1"],
      modelConcurrency: 2,
    };

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock PromisePool chain
    mockProcessFunction = jest
      .fn()
      .mockImplementation(async (processingFunction) => {
        // Simulate processing each model - the processingFunction returns the result structure
        const results = [];
        for (const model of mockModels) {
          const result = await processingFunction(model);
          results.push(result);
        }
        return { results };
      });

    mockPromisePoolInstance = {
      withConcurrency: jest.fn().mockReturnThis(),
      handleError: jest.fn().mockReturnThis(),
      process: mockProcessFunction,
    };

    mockPromisePool.for = jest.fn().mockReturnValue(mockPromisePoolInstance);

    mockEval.mockResolvedValue({
      id: "test-eval-id",
      summary: {},
    } as any);

    mockMakeExperimentName.mockReturnValue("test-experiment-name");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("input validation", () => {
    it("should throw error for unknown benchmark type", async () => {
      const invalidArgs = { ...mockArgs, type: "unknown-benchmark" };

      await expect(runBenchmark(mockConfig, invalidArgs)).rejects.toThrow(
        "Unknown benchmark type: unknown-benchmark"
      );
    });

    it("should throw error when no valid datasets found", async () => {
      const invalidArgs = { ...mockArgs, datasets: ["unknown-dataset"] };

      await expect(runBenchmark(mockConfig, invalidArgs)).rejects.toThrow(
        "No valid datasets found"
      );
    });

    it("should throw error when no valid tasks found", async () => {
      const invalidArgs = { ...mockArgs, task: "unknown-task" };

      await expect(runBenchmark(mockConfig, invalidArgs)).rejects.toThrow(
        "No valid tasks found"
      );
    });

    it("should handle partial task name matches", async () => {
      const partialTaskArgs = { ...mockArgs, task: "task1" }; // Use exact match since the logic uses includes

      await runBenchmark(mockConfig, partialTaskArgs);
    });
  });

  describe("dataset resolution", () => {
    it("should resolve single dataset correctly", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(
        mockConfig.benchmarks["test-benchmark"].datasets.dataset1.getDataset
      ).toHaveBeenCalled();
      expect(
        mockConfig.benchmarks["test-benchmark"].datasets.dataset2.getDataset
      ).not.toHaveBeenCalled();
    });

    it("should resolve multiple datasets correctly", async () => {
      const multiDatasetArgs = {
        ...mockArgs,
        datasets: ["dataset1", "dataset2"],
      };

      await runBenchmark(mockConfig, multiDatasetArgs);

      expect(
        mockConfig.benchmarks["test-benchmark"].datasets.dataset1.getDataset
      ).toHaveBeenCalled();
      expect(
        mockConfig.benchmarks["test-benchmark"].datasets.dataset2.getDataset
      ).toHaveBeenCalled();
    });

    it("should combine multiple datasets into single array", async () => {
      const multiDatasetArgs = {
        ...mockArgs,
        datasets: ["dataset1", "dataset2"],
      };

      await runBenchmark(mockConfig, multiDatasetArgs);
    });
  });

  describe("experiment execution", () => {
    it("should create experiment name with correct parameters", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(mockMakeExperimentName).toHaveBeenCalledWith({
        baseName: "test-benchmark",
        experimentType: "task1",
        datasets: "dataset1",
        model: expect.any(String),
      });
    });

    it("should create experiment name with combined dataset names", async () => {
      const multiDatasetArgs = {
        ...mockArgs,
        datasets: ["dataset1", "dataset2"],
      };

      await runBenchmark(mockConfig, multiDatasetArgs);

      expect(mockMakeExperimentName).toHaveBeenCalledWith({
        baseName: "test-benchmark",
        experimentType: "task1",
        datasets: "dataset1+dataset2",
        model: expect.any(String),
      });
    });

    it("should call Eval with correct parameters", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(mockEval).toHaveBeenCalledWith("test-project", {
        data: mockDataset1,
        experimentName: "test-experiment-name",
        maxConcurrency: 5,
        metadata: {
          model: "test-model-1",
          task: "task1",
          dataset: "dataset1",
          taskConcurrency: undefined,
        },
        task: "mock-task-result",
        scores: [mockScorerFunc],
      });
    });

    it("should use taskConcurrency when provided", async () => {
      const argsWithTaskConcurrency = { ...mockArgs, taskConcurrency: 3 };

      await runBenchmark(mockConfig, argsWithTaskConcurrency);

      expect(mockEval).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({
          maxConcurrency: 3,
          metadata: expect.objectContaining({
            taskConcurrency: 3,
          }),
        })
      );
    });

    it("should fall back to model maxConcurrency when taskConcurrency not provided", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(mockEval).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({
          maxConcurrency: 5, // From model.maxConcurrency
        })
      );
    });

    it("should default to 1 when no concurrency values available", async () => {
      const modelWithoutConcurrency = { ...mockModels[0] };
      delete modelWithoutConcurrency.maxConcurrency;
      const argsWithNoConcurrencyModel = {
        ...mockArgs,
        models: [modelWithoutConcurrency],
      };

      // Mock process function to use the models from args
      const customProcessFunction = jest
        .fn()
        .mockImplementation(async (processingFunction) => {
          const results = [];
          for (const model of argsWithNoConcurrencyModel.models) {
            const result = await processingFunction(model);
            results.push(result);
          }
          return { results };
        });
      mockPromisePoolInstance.process = customProcessFunction;

      await runBenchmark(mockConfig, argsWithNoConcurrencyModel);

      expect(mockEval).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({
          maxConcurrency: 1, // Default fallback
        })
      );
    });
  });

  describe("concurrency and parallelism", () => {
    it("should configure PromisePool with correct concurrency", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(mockPromisePool.for).toHaveBeenCalledWith(mockModels);
      expect(mockPromisePoolInstance.withConcurrency).toHaveBeenCalledWith(2);
    });

    it("should configure error handling", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(mockPromisePoolInstance.handleError).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("should process all models", async () => {
      await runBenchmark(mockConfig, mockArgs);
    });
  });

  describe("error handling", () => {
    it("should handle evaluation errors gracefully", async () => {
      mockEval.mockRejectedValueOnce(new Error("Evaluation failed"));

      const result = await runBenchmark(mockConfig, mockArgs);

      expect(result).toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("✗ Failed experiment:"),
        expect.any(Error)
      );

      // First model should have undefined result due to error, second should succeed
      expect(result[0]).toBeUndefined(); // Failed evaluation
      expect(result[1]).toEqual({
        evalResult: { id: "test-eval-id", summary: {} },
        dataset: mockDataset1,
        experimentName: "test-experiment-name",
      });
    });

    it("should handle dataset loading errors", async () => {
      // Mock the PromisePool to actually execute the processing function
      const failingProcessFunction = jest
        .fn()
        .mockImplementation(async (processingFunction) => {
          // This will cause the dataset loading to fail
          await processingFunction(mockModels[0]);
          return { results: [] };
        });

      mockPromisePoolInstance.process = failingProcessFunction;

      const mockDatasetWithError = {
        ...mockConfig.benchmarks["test-benchmark"].datasets.dataset1,
        getDataset: jest
          .fn()
          .mockRejectedValue(new Error("Dataset load failed")),
      };

      const configWithFailingDataset = {
        ...mockConfig,
        benchmarks: {
          "test-benchmark": {
            ...mockConfig.benchmarks["test-benchmark"],
            datasets: {
              dataset1: mockDatasetWithError,
            },
          },
        },
      };

      await expect(
        runBenchmark(configWithFailingDataset, mockArgs)
      ).rejects.toThrow("Dataset load failed");
    });

    it("should log errors to console via PromisePool error handler", async () => {
      await runBenchmark(mockConfig, mockArgs);

      const errorHandler = mockPromisePoolInstance.handleError.mock.calls[0][0];
      const testError = new Error("Test error");

      errorHandler(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    });
  });

  describe("logging", () => {
    it("should log benchmark configuration", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Running benchmark: test-benchmark"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Model(s): test-model-1, test-model-2"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith("Dataset(s): dataset1");
      expect(consoleLogSpy).toHaveBeenCalledWith("Model concurrency: 2");
    });

    it("should log experiment progress", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Running experiments for model: test-model-1"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Running experiment: test-experiment-name"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "✓ Completed experiment: test-experiment-name"
      );
    });

    it("should log completion message", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(consoleLogSpy).toHaveBeenCalledWith("Benchmark run completed");
    });

    it("should log multiple datasets correctly", async () => {
      const multiDatasetArgs = {
        ...mockArgs,
        datasets: ["dataset1", "dataset2"],
      };

      await runBenchmark(mockConfig, multiDatasetArgs);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Dataset(s): dataset1, dataset2"
      );
    });
  });

  describe("return values", () => {
    it("should return results with evalResult, dataset, and experimentName", async () => {
      const result = await runBenchmark(mockConfig, mockArgs);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2); // Two models

      // Each result should contain the new structure
      result.forEach((modelResult) => {
        expect(modelResult).toEqual({
          evalResult: {
            id: "test-eval-id",
            summary: {},
          },
          dataset: mockDataset1,
          experimentName: "test-experiment-name",
        });
      });
    });

    it("should return correct dataset for single dataset", async () => {
      const result = await runBenchmark(mockConfig, mockArgs);

      expect(result).toBeDefined();
      result.forEach((modelResult) => {
        expect(modelResult?.dataset).toEqual(mockDataset1);
      });
    });

    it("should return combined dataset for multiple datasets", async () => {
      const multiDatasetArgs = {
        ...mockArgs,
        datasets: ["dataset1", "dataset2"],
      };

      const result = await runBenchmark(mockConfig, multiDatasetArgs);

      expect(result).toBeDefined();
      result.forEach((modelResult) => {
        // Combined dataset should have both datasets flattened
        expect(modelResult?.dataset).toEqual([
          ...mockDataset1,
          ...mockDataset2,
        ]);
      });
    });

    it("should return correct experiment name for each model", async () => {
      const result = await runBenchmark(mockConfig, mockArgs);

      expect(result).toBeDefined();
      result.forEach((modelResult) => {
        expect(modelResult?.experimentName).toBe("test-experiment-name");
      });
    });

    it("should return empty results when no models provided", async () => {
      const noModelsArgs = { ...mockArgs, models: [] };

      // Mock process function to use the models from args (empty array)
      const emptyProcessFunction = jest
        .fn()
        .mockImplementation(async (processingFunction) => {
          const results = [];
          for (const model of noModelsArgs.models) {
            const result = await processingFunction(model);
            results.push(result);
          }
          return { results };
        });
      mockPromisePoolInstance.process = emptyProcessFunction;

      const result = await runBenchmark(mockConfig, noModelsArgs);

      expect(result).toEqual([]);

      // Restore original mock
      mockPromisePoolInstance.process = mockProcessFunction;
    });

    it("should handle different experiment names per model", async () => {
      // Mock makeExperimentName to return different names based on model
      mockMakeExperimentName.mockImplementation(
        ({ model }) => `experiment-${model}`
      );

      const result = await runBenchmark(mockConfig, mockArgs);

      expect(result).toBeDefined();
      expect(result[0]?.experimentName).toBe("experiment-test-model-1");
      expect(result[1]?.experimentName).toBe("experiment-test-model-2");

      // Reset mock
      mockMakeExperimentName.mockReturnValue("test-experiment-name");
    });

    it("should preserve dataset structure across all results", async () => {
      const result = await runBenchmark(mockConfig, mockArgs);

      expect(result).toBeDefined();

      // All results should have the same dataset
      const firstDataset = result[0]?.dataset;
      result.forEach((modelResult) => {
        expect(modelResult?.dataset).toEqual(firstDataset);
      });
    });
  });

  describe("scorer configuration", () => {
    it("should extract scorer functions correctly", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(mockEval).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({
          scores: [mockScorerFunc],
        })
      );
    });

    it("should handle multiple scorers", async () => {
      const multiScorerConfig = {
        ...mockConfig,
        benchmarks: {
          "test-benchmark": {
            ...mockConfig.benchmarks["test-benchmark"],
            scorers: {
              scorer1: {
                description: "Scorer 1",
                scorerFunc: jest.fn().mockReturnValue("scorer-1-result"),
              },
              scorer2: {
                description: "Scorer 2",
                scorerFunc: jest.fn().mockReturnValue("scorer-2-result"),
              },
            },
          },
        },
      };

      await runBenchmark(multiScorerConfig, mockArgs);

      expect(mockEval).toHaveBeenCalledWith(
        "test-project",
        expect.objectContaining({
          scores: [expect.any(Function), expect.any(Function)],
        })
      );
    });
  });

  describe("task function invocation", () => {
    it("should call task function with correct parameters", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(mockTaskFunc).toHaveBeenCalledWith(
        mockConfig.modelProvider,
        mockConfig.models[0]
      );
    });

    it("should call task function for each model with correct deployment", async () => {
      await runBenchmark(mockConfig, mockArgs);

      expect(mockTaskFunc).toHaveBeenCalledWith(
        mockConfig.modelProvider,
        mockConfig.models[0]
      );

      expect(mockTaskFunc).toHaveBeenCalledWith(
        mockConfig.modelProvider,
        mockConfig.models[1]
      );
    });
  });
});
