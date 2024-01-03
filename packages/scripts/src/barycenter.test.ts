import { barycenter } from "./barycenter";

describe("barycenter", () => {
  it("finds barycenter of n-dimensional vectors", () => {
    expect(
      barycenter([
        [0, 0],
        [1, 1],
      ])
    ).toStrictEqual([0.5, 0.5]);

    expect(
      barycenter([
        [4, 0, 0],
        [0, 4, 4],
        [4, 0, 4],
        [0, 0, 4],
      ])
    ).toStrictEqual([2, 1, 3]);

    expect(
      barycenter([
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ])
    ).toStrictEqual([1, 1, 1]);
  });

  it("rejects mixed-dimensional vectors", () => {
    expect(() => {
      barycenter([[1], [1, 1]]);
    }).toThrow();
  });

  it("rejects empty vector set", () => {
    expect(() => {
      barycenter([]);
    }).toThrow();
  });
});
