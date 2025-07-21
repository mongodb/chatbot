import yargs from "yargs";
import { createBenchmarkCli } from "./index";
import { runBenchmark } from "./runBenchmark";
import { BenchmarkCliConfig } from "./BenchmarkConfig";

// Mock the runBenchmark function
jest.mock("./runBenchmark");
const mockRunBenchmark = runBenchmark as jest.MockedFunction<
  typeof runBenchmark
>;

describe("createBenchmarkCli", () => {
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
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    mockRunBenchmark.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("run command", () => {
    it("should create a yargs CLI with run command", () => {
      const cli = createBenchmarkCli(mockConfig);
      expect(cli).toBeDefined();
    });

    it("should validate required options", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse(["run"]);
      }).toThrow("process.exit called");
    });

    it("should validate unknown benchmark type", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "unknown-benchmark",
          "--dataset",
          "dataset1",
        ]);
      }).toThrow("process.exit called");
    });

    it("should validate unknown task", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "test-benchmark",
          "--dataset",
          "dataset1",
          "--task",
          "unknown-task",
        ]);
      }).toThrow("process.exit called");
    });

    it("should validate unknown dataset", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "test-benchmark",
          "--dataset",
          "unknown-dataset",
        ]);
      }).toThrow("process.exit called");
    });

    it("should validate taskConcurrency range", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "test-benchmark",
          "--dataset",
          "dataset1",
          "--taskConcurrency",
          "0",
        ]);
      }).toThrow("process.exit called");

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "test-benchmark",
          "--dataset",
          "dataset1",
          "--taskConcurrency",
          "51",
        ]);
      }).toThrow("process.exit called");
    });

    it("should validate modelConcurrency range", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "test-benchmark",
          "--dataset",
          "dataset1",
          "--modelConcurrency",
          "0",
        ]);
      }).toThrow("process.exit called");

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "test-benchmark",
          "--dataset",
          "dataset1",
          "--modelConcurrency",
          "6",
        ]);
      }).toThrow("process.exit called");
    });

    it("should successfully run benchmark with valid arguments", async () => {
      const cli = createBenchmarkCli(mockConfig);

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
      const cli = createBenchmarkCli(mockConfig);

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
      const cli = createBenchmarkCli(mockConfig);

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

      const cli = createBenchmarkCli(mockConfig);

      // Expect the process.exit call and catch the thrown error
      await expect(
        cli.parse(["run", "--type", "test-benchmark", "--dataset", "dataset1"])
      ).rejects.toThrow("process.exit called");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error running benchmark:",
        expect.any(Error)
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("list command", () => {
    it("should list all available benchmarks", async () => {
      const cli = createBenchmarkCli(mockConfig);

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
      const cli = createBenchmarkCli(mockConfig);

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
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse([]);
      }).toThrow("process.exit called");
    });

    it("should have help alias", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse(["--help"]);
      }).toThrow("process.exit called");
    });

    it("should have version alias", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse(["--version"]);
      }).toThrow("process.exit called");
    });
  });

  describe("edge cases", () => {
    it("should handle empty config gracefully", async () => {
      const emptyConfig: BenchmarkCliConfig = {
        models: [],
        modelProvider: { baseUrl: "", apiKey: "" },
        benchmarks: {},
      };

      const cli = createBenchmarkCli(emptyConfig);

      expect(() => {
        cli.parse(["run", "--type", "any-type", "--dataset", "any-dataset"]);
      }).toThrow("process.exit called");
    });

    it("should validate non-integer taskConcurrency", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "test-benchmark",
          "--dataset",
          "dataset1",
          "--taskConcurrency",
          "2.5",
        ]);
      }).toThrow("process.exit called");
    });

    it("should validate non-integer modelConcurrency", async () => {
      const cli = createBenchmarkCli(mockConfig);

      expect(() => {
        cli.parse([
          "run",
          "--type",
          "test-benchmark",
          "--dataset",
          "dataset1",
          "--modelConcurrency",
          "1.5",
        ]);
      }).toThrow("process.exit called");
    });
  });
});
