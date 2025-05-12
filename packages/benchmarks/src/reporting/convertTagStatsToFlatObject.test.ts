import { convertTagStatsToFlatObject } from "./convertTagStatsToFlatObject";

describe("convertTagStatsToFlatObject", () => {
  test("converts tagStats Map to a flat object with formatted headers", () => {
    // Create a mock tagStats Map
    const tagStats = new Map();

    // Add stats for mongodb tag
    tagStats.set("foo", {
      accuracy: {
        mean: 0.9,
        median: 0.9,
        mode: 0.9,
        min: 0.8,
        max: 1.0,
        count: 3,
      },
      relevance: {
        mean: 0.8,
        median: 0.8,
        mode: null,
        min: 0.7,
        max: 0.9,
        count: 3,
      },
    });

    // Add stats for postgres tag
    tagStats.set("bar", {
      accuracy: {
        mean: 0.7,
        median: 0.7,
        mode: 0.7,
        min: 0.6,
        max: 0.8,
        count: 3,
      },
    });

    // Convert to flat object
    const result = convertTagStatsToFlatObject(tagStats);

    // Check foo tag
    expect(result.foo).toBeDefined();
    expect(result.foo["accuracy.mean"]).toBe(0.9);
    expect(result.foo["accuracy.median"]).toBe(0.9);
    expect(result.foo["accuracy.mode"]).toBe(0.9);
    expect(result.foo["accuracy.min"]).toBe(0.8);
    expect(result.foo["accuracy.max"]).toBe(1.0);
    expect(result.foo["accuracy.count"]).toBe(3);

    expect(result.foo["relevance.mean"]).toBe(0.8);
    expect(result.foo["relevance.mode"]).toBeNull();

    // Check bar tag
    expect(result.bar).toBeDefined();
    expect(result.bar["accuracy.mean"]).toBe(0.7);
    expect(result.bar["accuracy.count"]).toBe(3);

    // Check that relevance metrics don't exist for bar
    expect(result.bar["relevance.mean"]).toBeUndefined();
  });

  test("returns an empty object for empty tagStats", () => {
    const tagStats = new Map();
    const result = convertTagStatsToFlatObject(tagStats);

    expect(Object.keys(result).length).toBe(0);
  });
});
