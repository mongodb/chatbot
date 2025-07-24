import {
  normalizedSquareMagnitude,
  normalizedSquareMagnitudeDifference,
  squareMagnitude,
  squareMagnitudeDifference,
} from "./squareMagnitude";

describe("squareMagnitude", () => {
  it("returns 0 for an empty vector", () => {
    expect(squareMagnitude([])).toBe(0);
  });

  it("returns correct value for a single-element vector", () => {
    expect(squareMagnitude([3])).toBe(9);
  });

  it("returns correct value for a multi-element vector", () => {
    // [1, 2, 2] → 1^2 + 2^2 + 2^2 = 1 + 4 + 4 = 9
    expect(squareMagnitude([1, 2, 2])).toBe(9);
  });

  it("handles negative values correctly", () => {
    // [-3, 4] → 9 + 16 = 25
    expect(squareMagnitude([-3, 4])).toBe(25);
  });
});

describe("squareMagnitudeDifference", () => {
  it("returns 0 for identical vectors", () => {
    expect(squareMagnitudeDifference([1, 2], [1, 2])).toBe(0);
  });

  it("returns correct difference for vectors of different magnitudes", () => {
    const result = squareMagnitudeDifference([1, 2], [2, 2]);
    // [1,2] → 1^2 + 2^2 = 5; [2,2] → 2^2 + 2^2 = 8; diff = 3
    expect(result).toBe(3);
  });

  it("is symmetric with respect to argument order", () => {
    const a = [3, 4]; // mag^2 = 25
    const b = [0, 5]; // mag^2 = 25
    expect(squareMagnitudeDifference(a, b)).toBe(0);
    expect(squareMagnitudeDifference(b, a)).toBe(0);
  });

  it("throws an error for vectors of different dimensions", () => {
    expect(() => squareMagnitudeDifference([1, 2], [1, 2, 3])).toThrow(
      "Vector length mismatch!"
    );
  });
});

describe("normalizedSquareMagnitude", () => {
  it("returns 0 for a zero vector", () => {
    expect(normalizedSquareMagnitude([0, 0, 0])).toBe(0);
  });

  it("returns 1 for a vector of all ones", () => {
    expect(normalizedSquareMagnitude([1, 1, 1, 1])).toBe(1);
  });

  it("returns correct value for mixed values", () => {
    // [1, 0, -1] → squares: [1, 0, 1] → sum: 2 → norm: 2 / 3
    expect(normalizedSquareMagnitude([1, 0, -1])).toBeCloseTo(2 / 3);
  });

  it("returns correct value for single-element vector", () => {
    expect(normalizedSquareMagnitude([0.5])).toBeCloseTo(0.25);
  });

  it("throws for out-of-bound values", () => {
    expect(() => normalizedSquareMagnitude([1.5])).toThrow();
    expect(() => normalizedSquareMagnitude([-1.1])).toThrow();
  });

  it("throws for empty vector", () => {
    expect(() => normalizedSquareMagnitude([])).toThrow();
  });
});

describe("normalizedSquareMagnitudeDifference", () => {
  it("returns 0 for identical vectors", () => {
    const v = [0.5, -0.5, 0];
    expect(normalizedSquareMagnitudeDifference(v, v)).toBe(0);
  });

  it("returns correct difference for different vectors", () => {
    const a = [1, 0, 0]; // mag² = 1, norm = 1/3
    const b = [1, 1, 1]; // mag² = 3, norm = 1
    expect(normalizedSquareMagnitudeDifference(a, b)).toBeCloseTo(2 / 3);
  });

  it("handles negative values correctly", () => {
    const a = [-1, 0]; // mag² = 1, norm = 0.5
    const b = [0, 0]; // mag² = 0, norm = 0
    expect(normalizedSquareMagnitudeDifference(a, b)).toBe(0.5);
  });

  it("throws for vectors with out-of-bound values", () => {
    expect(() => normalizedSquareMagnitudeDifference([2], [0])).toThrow();
    expect(() => normalizedSquareMagnitudeDifference([0], [-2])).toThrow();
  });

  it("throws for empty vectors", () => {
    expect(() => normalizedSquareMagnitudeDifference([], [0])).toThrow();
    expect(() => normalizedSquareMagnitudeDifference([0], [])).toThrow();
  });
});
