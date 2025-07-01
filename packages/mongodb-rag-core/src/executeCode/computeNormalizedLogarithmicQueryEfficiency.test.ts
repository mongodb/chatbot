import { computeNormalizedLogarithmicQueryEfficiency } from "./computeNormalizedLogarithmicQueryEfficiency";

describe("computeNormalizedLogarithmicQueryEfficiency", () => {
  it("should return 1.0 for perfect efficiency (n_examined = n_returned)", () => {
    const smallerPerfectEfficiency = 100;
    expect(
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: smallerPerfectEfficiency,
        nExamined: smallerPerfectEfficiency,
        nTotal: 1000000,
      })
    ).toBeCloseTo(1.0);
    const largerPerfectEfficiency = 1000;
    expect(
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: largerPerfectEfficiency,
        nExamined: largerPerfectEfficiency,
        nTotal: 1000000,
      })
    ).toBeCloseTo(1.0);
  });

  it("should return decreasing scores for increasing examination overhead", () => {
    const nTotal = 1000000;
    const nReturned = 100;

    const score10x = computeNormalizedLogarithmicQueryEfficiency({
      nReturned,
      nExamined: 1000,
      nTotal,
    });
    const score100x = computeNormalizedLogarithmicQueryEfficiency({
      nReturned,
      nExamined: 10000,
      nTotal,
    });
    const score1000x = computeNormalizedLogarithmicQueryEfficiency({
      nReturned,
      nExamined: 100000,
      nTotal,
    });

    expect(score10x).toBeCloseTo(0.75, 2);
    expect(score100x).toBeCloseTo(0.5, 2);
    expect(score1000x).toBeCloseTo(0.25, 2);

    expect(score10x > score100x).toBe(true);
    expect(score100x > score1000x).toBe(true);
  });

  it("should return 0.0 for full scans with small results", () => {
    expect(
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 100,
        nExamined: 1000000,
        nTotal: 1000000,
      })
    ).toBeCloseTo(0.0);
  });

  it("should handle large n_returned values appropriately", () => {
    const nTotal = 1000000;

    expect(
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 500000,
        nExamined: 800000,
        nTotal,
      })
    ).toBeCloseTo(0.3219, 3);
    expect(
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 500000,
        nExamined: 900000,
        nTotal,
      })
    ).toBeCloseTo(0.152, 3);
    expect(
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 500000,
        nExamined: 1000000,
        nTotal,
      })
    ).toBeCloseTo(0.0, 3);
  });

  it("should handle unavoidable almost full scans", () => {
    expect(
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 900000,
        nExamined: 950000,
        nTotal: 1000000,
      })
    ).toBeCloseTo(0.4868, 3);
  });

  it("should handle edge case where n_returned equals n_total", () => {
    expect(
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 1000000,
        nExamined: 1000000,
        nTotal: 1000000,
      })
    ).toBe(1.0);
  });

  it("should throw error for invalid inputs", () => {
    expect(() =>
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 0,
        nExamined: 100,
        nTotal: 1000,
      })
    ).toThrow();
    expect(() =>
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 100,
        nExamined: 0,
        nTotal: 1000,
      })
    ).toThrow();
    expect(() =>
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 100,
        nExamined: 100,
        nTotal: 0,
      })
    ).toThrow();
    // Examined must be >= returned
    expect(() =>
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 100,
        nExamined: 50,
        nTotal: 1000,
      })
    ).toThrow();
    // Total must be >= examined
    expect(() =>
      computeNormalizedLogarithmicQueryEfficiency({
        nReturned: 100,
        nExamined: 200,
        nTotal: 150,
      })
    ).toThrow();
  });

  it("should clamp results between 0 and 1", () => {
    const result = computeNormalizedLogarithmicQueryEfficiency({
      nReturned: 1,
      nExamined: 1000,
      nTotal: 10000,
    });
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});
