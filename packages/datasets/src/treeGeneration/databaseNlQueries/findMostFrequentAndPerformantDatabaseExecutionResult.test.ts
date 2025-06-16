import {
  fuzzyMatchDatabaseExecutionResults,
  findMostFrequentAndPerformantDatabaseExecutionResult,
  fuzzyClusterDatabaseExecutionResults,
  getClusterFastestExecutionTimeExecutionResultIndex,
} from "./findMostFrequentAndPerformantDatabaseExecutionResult";

describe("fuzzyMatchDatabaseExecutionResults", () => {
  // Test when both results are null
  it("should return true when both results are null", () => {
    const a = {
      result: null,
      methods: [],
      queryOperators: [],
      executionTimeMs: null,
    };
    const b = {
      result: null,
      methods: [],
      queryOperators: [],
      executionTimeMs: null,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(true);
  });

  // Test when one result is null and the other is not
  it("should return false when only one result is null", () => {
    const a = {
      result: null,
      methods: [],
      queryOperators: [],
      executionTimeMs: null,
    };
    const b = {
      result: [{ name: "test" }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };

    const result1 = fuzzyMatchDatabaseExecutionResults(a, b);
    const result2 = fuzzyMatchDatabaseExecutionResults(b, a);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });

  it("should return true for identical results", () => {
    const a = {
      result: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
      methods: ["find"],
      queryOperators: [],
      executionTimeMs: 100,
    };
    const b = {
      result: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
      methods: [],
      queryOperators: [],
      executionTimeMs: 150,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(true);
  });

  // Test with documents that differ but are within allowed number difference
  it("should return true when numbers differ within allowed tolerance", () => {
    const a = {
      result: [{ id: 1, score: 95.005 }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };
    const b = {
      result: [{ id: 1, score: 95.0 }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(true);
  });

  // Test with documents that differ beyond allowed number difference
  it("should return false when numbers differ beyond allowed tolerance", () => {
    const a = {
      result: [{ id: 1, score: 95.5 }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };
    const b = {
      result: [{ id: 1, score: 95.0 }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(false);
  });

  // Test with aggregation results
  it("should handle aggregation results correctly", () => {
    const a = {
      result: [
        { _id: "group1", count: 5 },
        { _id: "group2", count: 10 },
      ],
      methods: ["aggregation"],
      queryOperators: [],
      executionTimeMs: 100,
    };
    const b = {
      result: [
        { _id: "group2", count: 10 },
        { _id: "group1", count: 5 },
      ],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(true);
  });

  // Test with sort operation where order matters
  it("should respect order when sort is used", () => {
    const a = {
      result: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
      methods: ["sort"],
      queryOperators: [],
      executionTimeMs: 100,
    };
    const b = {
      result: [
        { id: 2, name: "Bob" },
        { id: 1, name: "Alice" },
      ],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(false);
  });

  // Test with $sort query operator where order matters
  it("should respect order when $sort query operator is used", () => {
    const a = {
      result: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
      methods: [],
      queryOperators: ["$sort"],
      executionTimeMs: 100,
    };
    const b = {
      result: [
        { id: 2, name: "Bob" },
        { id: 1, name: "Alice" },
      ],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(false);
  });

  // Test with objects that have extra fields
  it("should return true when objects have extra fields", () => {
    const a = {
      result: [{ id: 1, name: "Alice", age: 30, city: "New York" }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };
    const b = {
      result: [{ id: 1, name: "Alice" }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(true);
  });

  // Test with numeric results - updated to use arrays
  it("should handle numeric results", () => {
    const a = {
      result: [{ value: 42 }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };
    const b = {
      result: [{ value: 42 }],
      methods: [],
      queryOperators: [],
      executionTimeMs: 100,
    };

    const result = fuzzyMatchDatabaseExecutionResults(a, b);

    expect(result).toBe(true);
  });
});

describe("fuzzyClusterDatabaseExecutionResults", () => {
  it("should cluster similar database execution results", () => {
    // Create an array of database execution results
    const items = [
      // First cluster - all null results
      {
        result: null,
        methods: [],
        queryOperators: [],
        executionTimeMs: null,
      },
      {
        result: null,
        methods: ["find"],
        queryOperators: [],
        executionTimeMs: null,
      },
      // Second cluster - identical document results
      {
        result: [{ id: 1, name: "Alice" }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
      {
        result: [{ id: 1, name: "Alice" }],
        methods: ["find"],
        queryOperators: [],
        executionTimeMs: 150,
      },
      // Third cluster - numeric results (wrapped in arrays)
      {
        result: [{ value: 42 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
      {
        result: [{ value: 42 }],
        methods: ["count"],
        queryOperators: [],
        executionTimeMs: 50,
      },
    ];

    const clusters = fuzzyClusterDatabaseExecutionResults(items);

    // Expected clusters:
    // Cluster 1: [0, 1] - null results
    // Cluster 2: [2, 3] - identical document results
    // Cluster 3: [4, 5] - identical numeric results
    expect(clusters).toHaveLength(3);
    expect(clusters).toContainEqual([0, 1]);
    expect(clusters).toContainEqual([2, 3]);
    expect(clusters).toContainEqual([4, 5]);
  });

  it("should handle empty input array", () => {
    const items: any[] = [];
    const clusters = fuzzyClusterDatabaseExecutionResults(items);
    expect(clusters).toEqual([]);
  });

  it("should create individual clusters for non-matching results", () => {
    const items = [
      {
        result: [{ id: 1, name: "Alice" }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
      {
        result: [{ id: 2, name: "Bob" }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 150,
      },
      {
        result: [{ id: 3, name: "Charlie" }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 200,
      },
    ];

    const clusters = fuzzyClusterDatabaseExecutionResults(items);

    // Each item should be in its own cluster
    expect(clusters).toHaveLength(3);
    expect(clusters).toContainEqual([0]);
    expect(clusters).toContainEqual([1]);
    expect(clusters).toContainEqual([2]);
  });
});

describe("getClusterFastestExecutionTimeExecutionResultIndex", () => {
  it("should return the index of the item with the fastest execution time", () => {
    const cluster = [
      {
        result: [{ id: 1 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
      {
        result: [{ id: 1 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 50, // Fastest
      },
      {
        result: [{ id: 1 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 150,
      },
    ];

    const fastestIndex =
      getClusterFastestExecutionTimeExecutionResultIndex(cluster);

    expect(fastestIndex).toBe(1); // Index of the item with executionTimeMs: 50
  });

  it("should handle null execution times by treating them as Infinity", () => {
    const cluster = [
      {
        result: [{ id: 1 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: null,
      },
      {
        result: [{ id: 1 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100, // Fastest because the others are null
      },
      {
        result: [{ id: 1 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: null,
      },
    ];

    const fastestIndex =
      getClusterFastestExecutionTimeExecutionResultIndex(cluster);

    expect(fastestIndex).toBe(1); // Index of the item with executionTimeMs: 100
  });

  it("should return the first index when all execution times are the same", () => {
    const cluster = [
      {
        result: [{ id: 1 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
      {
        result: [{ id: 2 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
      {
        result: [{ id: 3 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
    ];

    const fastestIndex =
      getClusterFastestExecutionTimeExecutionResultIndex(cluster);

    expect(fastestIndex).toBe(0); // First index when all times are equal
  });

  it("should return null for empty clusters", () => {
    const cluster: any[] = [];
    const fastestIndex =
      getClusterFastestExecutionTimeExecutionResultIndex(cluster);
    expect(fastestIndex).toBeNull();
  });

  it("should return null for null clusters", () => {
    const fastestIndex =
      getClusterFastestExecutionTimeExecutionResultIndex(null);
    expect(fastestIndex).toBeNull();
  });
});

describe("findMostFrequentAndPerformantDatabaseExecutionResult", () => {
  it("should find the most frequent cluster and the fastest execution within it", () => {
    const items = [
      // First cluster - 2 items
      {
        result: [{ id: 1, name: "Alice" }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
      {
        result: [{ id: 1, name: "Alice" }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 150,
      },
      // Second cluster - 3 items (largest)
      {
        result: [{ value: 42 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 120,
      },
      {
        result: [{ value: 42 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 80, // Fastest in the largest cluster
      },
      {
        result: [{ value: 42 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
    ];

    const result = findMostFrequentAndPerformantDatabaseExecutionResult(items);

    // Should identify the second cluster as largest
    expect(result.clusters).toHaveLength(2);
    expect(result.clusters).toContainEqual([0, 1]); // First cluster
    expect(result.clusters).toContainEqual([2, 3, 4]); // Second cluster (largest)

    // Should identify index 1 in the largest cluster (which is index 3 in the original array)
    // as the fastest execution
    expect(result.fastestMostFrequentIndex).toBe(1);
  });

  it("should handle empty input array", () => {
    const items: any[] = [];
    expect(() => {
      findMostFrequentAndPerformantDatabaseExecutionResult(items);
    }).toThrow(); // Should throw because findLargestCluster throws on empty arrays
  });

  it("should handle single item arrays", () => {
    const items = [
      {
        result: [{ id: 1 }],
        methods: [],
        queryOperators: [],
        executionTimeMs: 100,
      },
    ];

    const result = findMostFrequentAndPerformantDatabaseExecutionResult(items);

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters).toEqual([[0]]);
    expect(result.fastestMostFrequentIndex).toBe(0);
  });
});
