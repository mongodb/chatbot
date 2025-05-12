import { calculateStats } from "./calculateStats";

describe("calculateStats", () => {
  test("calculates correct statistics for an array of numbers", () => {
    const values = [1, 2, 3, 4, 5];
    const stats = calculateStats(values);

    expect(stats.mean).toBe(3);
    expect(stats.median).toBe(3);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(5);
    expect(stats.count).toBe(values.length);
  });

  test("calculates correct median for even number of elements", () => {
    const values = [1, 2, 3, 4];
    const stats = calculateStats(values);

    expect(stats.median).toBe(2.5); // (2 + 3) / 2
  });

  test("calculates correct mode", () => {
    const values = [1, 2, 2, 3, 4];
    const stats = calculateStats(values);

    expect(stats.mode).toBe(2);
  });

  test("returns null for mode when all values have same frequency", () => {
    const values = [1, 2, 3, 4];
    const stats = calculateStats(values);

    expect(stats.mode).toBeNull();
  });

  test("throws error for empty array", () => {
    expect(() => calculateStats([])).toThrow(
      "Cannot calculate statistics for an empty array"
    );
  });
});
