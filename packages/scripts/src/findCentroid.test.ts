import { findCentroid } from "./findCentroid";

describe("findCentroid", () => {
  it("finds centroid (mean) of M n-dimensional vectors", () => {
    expect(
      findCentroid([
        [0, 0],
        [1, 1],
      ])
    ).toStrictEqual([0.5, 0.5]);

    expect(
      findCentroid([
        [4, 0, 0],
        [0, 4, 4],
        [4, 0, 4],
        [0, 0, 4],
      ])
    ).toStrictEqual([2, 1, 3]);

    expect(
      findCentroid([
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ])
    ).toStrictEqual([1, 1, 1]);
  });

  it("rejects mixed-dimensional vectors", () => {
    expect(() => {
      findCentroid([[1], [1, 1]]);
    }).toThrow();
  });

  it("rejects empty vector set", () => {
    expect(() => {
      findCentroid([]);
    }).toThrow();
  });
});
