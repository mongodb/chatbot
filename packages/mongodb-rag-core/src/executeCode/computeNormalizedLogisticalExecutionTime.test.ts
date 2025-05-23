import { computeNormalizedLogisticalExecutionTime } from "./computeNormalizedLogisticalExecutionTime";

describe("computeNormalizedLogisticalExecutionTime", () => {
  it("should return 1 when generated time is equal to reference time", () => {
    const result = computeNormalizedLogisticalExecutionTime(100, 100);
    expect(result).toBe(1);
  });

  it("should return 1 when generated time is faster than reference time", () => {
    const result = computeNormalizedLogisticalExecutionTime(50, 100);
    expect(result).toBe(1);
  });

  it("should return a value between 0 and 1 when generated time is slower than reference time", () => {
    const result = computeNormalizedLogisticalExecutionTime(200, 100);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it("should return a lower score for significantly slower execution times", () => {
    const slowerResult = computeNormalizedLogisticalExecutionTime(300, 100);
    const muchSlowerResult = computeNormalizedLogisticalExecutionTime(
      1000,
      100
    );
    expect(slowerResult).toBeGreaterThan(muchSlowerResult);
  });

  it("should adjust sensitivity based on alpha parameter", () => {
    // With higher alpha, the score decreases more rapidly as ratio increases
    const resultDefaultAlpha = computeNormalizedLogisticalExecutionTime(
      200,
      100
    ); // alpha = 1
    const resultHigherAlpha = computeNormalizedLogisticalExecutionTime(
      200,
      100,
      5
    );
    expect(resultHigherAlpha).toBeLessThan(resultDefaultAlpha);
  });

  it("should throw an error for non-positive execution times", () => {
    expect(() => computeNormalizedLogisticalExecutionTime(0, 100)).toThrow();
    expect(() => computeNormalizedLogisticalExecutionTime(100, 0)).toThrow();
    expect(() => computeNormalizedLogisticalExecutionTime(-50, 100)).toThrow();
  });
});
