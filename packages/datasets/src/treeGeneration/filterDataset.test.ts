import { describe, it, expect, vi, beforeEach } from "vitest";
import { filterExamplesForBalancedDataset } from "./filterDataset";
import { DatabaseNlQueryDatasetEntry } from "./databaseNlQueries/DatabaseNlQueryDatasetEntry";

describe("filterExamplesForBalancedDataset", () => {
  // Helper function to create mock dataset entries
  function createMockEntry({
    complexity = "simple",
    databaseName = "testDB",
    queryOperators = ["$match", "$group"],
    dbQuery = "db.collection.find()",
    nlQuery = "Find all documents",
    language = "javascript",
    isReferenceAnswer = true,
  }: Partial<DatabaseNlQueryDatasetEntry> & {
    queryOperators?: string[];
  } = {}): DatabaseNlQueryDatasetEntry {
    return {
      complexity,
      databaseName,
      dbQuery,
      nlQuery,
      language,
      isReferenceAnswer,
      result: null,
      error: null,
      executionTimeMs: 100,
      queryOperators: queryOperators,
      methods: ["find"],
    } as unknown as DatabaseNlQueryDatasetEntry;
  }

  it("should return the original dataset if it is smaller than the requested size", () => {
    const mockDataset = [
      createMockEntry(),
      createMockEntry({ complexity: "moderate" }),
    ];

    const result = filterExamplesForBalancedDataset(mockDataset, 5);

    expect(result).toBe(mockDataset);
    expect(result.length).toBe(2);
  });

  it("should balance complexity according to the specified ratios", () => {
    // Create a dataset with unbalanced complexity distribution
    const mockDataset = [
      // 60% simple (12)
      ...Array(12)
        .fill(null)
        .map(() => createMockEntry({ complexity: "simple" })),
      // 30% moderate (6)
      ...Array(6)
        .fill(null)
        .map(() => createMockEntry({ complexity: "moderate" })),
      // 10% complex (2)
      ...Array(2)
        .fill(null)
        .map(() => createMockEntry({ complexity: "complex" })),
    ];

    // Request a dataset of 10 entries
    const result = filterExamplesForBalancedDataset(mockDataset, 10);

    // Check if the result has the expected size
    expect(result.length).toBe(10);

    // Count entries by complexity
    const complexityCounts = {
      simple: result.filter((entry) => entry.complexity === "simple").length,
      moderate: result.filter((entry) => entry.complexity === "moderate")
        .length,
      complex: result.filter((entry) => entry.complexity === "complex").length,
    };

    // Check if the complexity distribution is roughly 30% simple, 50% moderate, 20% complex
    expect(complexityCounts.simple).toBe(3); // 30% of 10
    expect(complexityCounts.moderate).toBe(5); // 50% of 10
    expect(complexityCounts.complex).toBe(2); // 20% of 10
  });

  it("should handle rounding issues when calculating target counts", () => {
    // Create a dataset with entries of all complexities
    const mockDataset = [
      ...Array(10)
        .fill(null)
        .map(() => createMockEntry({ complexity: "simple" })),
      ...Array(10)
        .fill(null)
        .map(() => createMockEntry({ complexity: "moderate" })),
      ...Array(10)
        .fill(null)
        .map(() => createMockEntry({ complexity: "complex" })),
    ];

    // Request a dataset of 9 entries (which doesn't divide evenly by the ratios)
    const result = filterExamplesForBalancedDataset(mockDataset, 9);

    // Check if the result has the expected size
    expect(result.length).toBe(9);

    // The sum of all complexity counts should equal the requested size
    const totalCount = result.filter((entry) =>
      ["simple", "moderate", "complex"].includes(entry.complexity)
    ).length;

    expect(totalCount).toBe(9);
  });

  it("should prioritize rare operators when selecting entries", () => {
    // Create entries with common and rare operators
    const commonOperators = ["$match", "$group", "$project"];
    const rareOperators = ["$facet", "$bucket", "$redact"];

    const mockDataset = [
      // Entries with only common operators
      ...Array(10)
        .fill(null)
        .map(() =>
          createMockEntry({
            complexity: "simple",
            queryOperators: commonOperators,
            dbQuery: "db.collection.aggregate([{$match: {}}, {$group: {}}])",
          })
        ),
      // Entries with rare operators
      ...Array(5)
        .fill(null)
        .map((_, i) =>
          createMockEntry({
            complexity: "simple",
            queryOperators: [
              rareOperators[i % rareOperators.length],
              ...commonOperators,
            ],
            dbQuery: `db.collection.aggregate([{$match: {}}, {${
              rareOperators[i % rareOperators.length]
            }: {}}])`,
          })
        ),
    ];

    // Request a dataset with fewer entries than available simple entries
    const result = filterExamplesForBalancedDataset(mockDataset, 6);

    // Get the simple entries from the result
    const simpleEntries = result.filter(
      (entry) => entry.complexity === "simple"
    );

    // Count entries with rare operators
    const entriesWithRareOps = simpleEntries.filter((entry) =>
      entry.queryOperators?.some((op) => rareOperators.includes(op))
    );

    // Expect that entries with rare operators are prioritized
    expect(entriesWithRareOps.length).toBeGreaterThan(0);
    // The ratio of entries with rare operators should be higher in the result than in the original dataset
    const originalRatio = 5 / 15; // 5 rare out of 15 total
    const resultRatio = entriesWithRareOps.length / simpleEntries.length;
    expect(resultRatio).toBeGreaterThan(originalRatio);
  });

  it("should balance database representation", () => {
    // Create entries from different databases
    const databases = ["salesDB", "inventoryDB", "usersDB", "logsDB"];
    const complexities = ["simple", "moderate", "complex"];

    // Create a more structured dataset to ensure each database has entries of each complexity
    const mockDataset: DatabaseNlQueryDatasetEntry[] = [];

    // For each database, create entries of each complexity type
    for (const db of databases) {
      for (const complexity of complexities) {
        // Create multiple entries for each combination to ensure sufficient representation
        for (let i = 0; i < 3; i++) {
          mockDataset.push(
            createMockEntry({
              databaseName: db,
              complexity,
              // Add some variety to operators to make selection interesting
              queryOperators: [
                "$match",
                "$group",
                ...(i % 2 === 0 ? ["$project"] : []),
                ...(i % 3 === 0 ? ["$sort"] : []),
              ],
            })
          );
        }
      }
    }

    // Request a dataset of 20 entries
    const result = filterExamplesForBalancedDataset(mockDataset, 20);

    // Count entries by database
    const dbCounts: Record<string, number> = {};
    for (const db of databases) {
      dbCounts[db] = result.filter((entry) => entry.databaseName === db).length;
    }

    // Check if each database has at least some representation
    for (const db of databases) {
      expect(dbCounts[db]).toBeGreaterThan(0);
    }

    // Check if the distribution is somewhat balanced
    // No database should have more than 2x the entries of any other database
    const minCount = Math.min(...Object.values(dbCounts));
    const maxCount = Math.max(...Object.values(dbCounts));
    expect(maxCount).toBeLessThanOrEqual(minCount * 2);
  });

  it("should handle edge cases with missing complexity values", () => {
    // Create a dataset with some entries missing complexity values
    const mockDataset = [
      createMockEntry({ complexity: "simple" }),
      createMockEntry({ complexity: "moderate" }),
      createMockEntry({ complexity: "complex" }),
      createMockEntry({ complexity: "unknown" as any }),
      createMockEntry({ complexity: "" as any }),
    ];

    // The function should not throw an error
    expect(() =>
      filterExamplesForBalancedDataset(mockDataset, 3)
    ).not.toThrow();

    // The result should still have the expected size
    const result = filterExamplesForBalancedDataset(mockDataset, 3);
    expect(result.length).toBe(3);
  });

  it("should handle a large dataset efficiently", () => {
    // Create a large dataset with 1000 entries
    const mockDataset = Array(1000)
      .fill(null)
      .map((_, i) =>
        createMockEntry({
          complexity: ["simple", "moderate", "complex"][i % 3],
          databaseName: `db${i % 10}`,
          queryOperators: [
            "$match",
            "$group",
            "$project",
            ...(i % 5 === 0 ? ["$facet"] : []),
            ...(i % 7 === 0 ? ["$bucket"] : []),
            ...(i % 11 === 0 ? ["$redact"] : []),
          ],
          dbQuery: `db.collection.aggregate([{$match: {}}])`,
        })
      );

    // Request a much smaller dataset
    const result = filterExamplesForBalancedDataset(mockDataset, 100);

    // Check if the result has the expected size
    expect(result.length).toBe(100);

    // Count entries by complexity
    const complexityCounts = {
      simple: result.filter((entry) => entry.complexity === "simple").length,
      moderate: result.filter((entry) => entry.complexity === "moderate")
        .length,
      complex: result.filter((entry) => entry.complexity === "complex").length,
    };

    // Check if the complexity distribution is roughly as expected
    expect(complexityCounts.simple).toBeCloseTo(30, -1); // Allow some flexibility
    expect(complexityCounts.moderate).toBeCloseTo(50, -1);
    expect(complexityCounts.complex).toBeCloseTo(20, -1);
  });
});
