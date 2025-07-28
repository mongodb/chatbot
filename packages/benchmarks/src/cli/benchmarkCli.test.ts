import yargs from "yargs";
import { makeBenchmarkCli } from "./benchmarkCli";
import { runBenchmark } from "./runBenchmark";
import { BenchmarkCliConfig } from "./BenchmarkConfig";

// Mock the runBenchmark function
jest.mock("./runBenchmark");
const mockRunBenchmark = runBenchmark as jest.MockedFunction<
  typeof runBenchmark
>;

describe("makeBenchmarkCli", () => {
  let mockConfig: BenchmarkCliConfig;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    mockConfig = {
      models: [
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
      ],
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
              getDataset: jest.fn().mockResolvedValue([]),
            },
            dataset2: {
              description: "Test dataset 2",
              getDataset: jest.fn().mockResolvedValue([]),
            },
          },
          tasks: {
            task1: {
              description: "Test task 1",
              taskFunc: jest.fn(),
            },
            task2: {
              description: "Test task 2",
              taskFunc: jest.fn(),
            },
          },
          scorers: {
            scorer1: {
              description: "Test scorer 1",
              scorerFunc: jest.fn(),
            },
          },
        },
      },
    };

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    processExitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((code?: number) => {
        // Don't throw an error that crashes Jest workers
        // Instead, just record that process.exit was called
        return undefined as never;
      });

    mockRunBenchmark.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("run command", () => {
    it("should create a yargs CLI with run command", () => {
      const cli = makeBenchmarkCli(mockConfig);
      expect(cli).toBeDefined();
    });

    it("should validate required options", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse(["run"]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should validate unknown benchmark type", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse([
        "run",
        "--type",
        "unknown-benchmark",
        "--dataset",
        "dataset1",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should validate unknown task", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "--task",
        "unknown-task",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should validate unknown dataset", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "unknown-dataset",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should validate taskConcurrency range", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "--taskConcurrency",
        "0",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);

      processExitSpy.mockClear();

      cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "--taskConcurrency",
        "51",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should validate modelConcurrency range", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "--modelConcurrency",
        "0",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);

      processExitSpy.mockClear();

      cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "--modelConcurrency",
        "6",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should successfully run benchmark with valid arguments", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      await cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "--task",
        "task1",
      ]);

      expect(mockRunBenchmark).toHaveBeenCalledWith(mockConfig, {
        type: "test-benchmark",
        task: "task1",
        models: mockConfig.models,
        datasets: ["dataset1"],
        modelConcurrency: 2,
      });
    });

    it("should use default values when optional arguments not provided", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      await cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
      ]);

      expect(mockRunBenchmark).toHaveBeenCalledWith(mockConfig, {
        type: "test-benchmark",
        task: "task1", // First task
        models: mockConfig.models, // All models
        datasets: ["dataset1"],
        modelConcurrency: 2,
      });
    });

    it("should handle multiple datasets and models", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      await cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "dataset2",
        "--model",
        "test-model-1",
        "--taskConcurrency",
        "3",
        "--modelConcurrency",
        "1",
      ]);

      expect(mockRunBenchmark).toHaveBeenCalledWith(mockConfig, {
        type: "test-benchmark",
        task: "task1",
        models: [mockConfig.models[0]], // Only test-model-1
        datasets: ["dataset1", "dataset2"],
        modelConcurrency: 1,
      });
    });

    it("should handle benchmark execution errors", async () => {
      mockRunBenchmark.mockRejectedValueOnce(new Error("Benchmark failed"));

      const cli = makeBenchmarkCli(mockConfig);

      // Parse the CLI arguments (this is synchronous)
      const result = await cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
      ]);

      // The result should be the parsed arguments object
      expect(result).toMatchObject({
        type: "test-benchmark",
        dataset: ["dataset1"],
      });

      // Wait a bit for the async handler to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that error handling was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error running benchmark:",
        expect.any(Error)
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("list command", () => {
    it("should list all available benchmarks", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse(["list"]);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify(
          [
            {
              type: "test-benchmark",
              description: "Test benchmark",
              datasets: {
                dataset1: "Test dataset 1",
                dataset2: "Test dataset 2",
              },
              tasks: {
                task1: "Test task 1",
                task2: "Test task 2",
              },
              scorers: {
                scorer1: "Test scorer 1",
              },
            },
          ],
          null,
          2
        )
      );
    });
  });

  describe("models list command", () => {
    it("should list all available models", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse(["models", "list"]);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify(
          [
            {
              label: "test-model-1",
              provider: "braintrust",
              deployment: "gpt-4",
              maxConcurrency: 5,
            },
            {
              label: "test-model-2",
              provider: "braintrust",
              deployment: "gpt-3.5-turbo",
              maxConcurrency: 10,
            },
          ],
          null,
          2
        )
      );
    });
  });

  describe("help and version", () => {
    it("should require a command", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse([]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should have help alias", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse(["--help"]);
      expect(processExitSpy).toHaveBeenCalled();
    });

    it("should have version alias", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse(["--version"]);
      expect(processExitSpy).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty config gracefully", async () => {
      const emptyConfig: BenchmarkCliConfig = {
        models: [],
        modelProvider: { baseUrl: "", apiKey: "" },
        benchmarks: {},
      };

      const cli = makeBenchmarkCli(emptyConfig);

      cli.parse(["run", "--type", "any-type", "--dataset", "any-dataset"]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should validate non-integer taskConcurrency", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "--taskConcurrency",
        "2.5",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should validate non-integer modelConcurrency", async () => {
      const cli = makeBenchmarkCli(mockConfig);

      cli.parse([
        "run",
        "--type",
        "test-benchmark",
        "--dataset",
        "dataset1",
        "--modelConcurrency",
        "1.5",
      ]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
