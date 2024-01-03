import { clusterize } from "./clusterize";

describe("clusterize", () => {
  it("clusterizes nodes", () => {
    const { clusters, noise } = clusterize(
      [
        {
          name: "a",
          v: [1, 1.5, 1],
        },
        {
          name: "b",
          v: [1, 1, 1],
        },
        {
          name: "c",
          v: [100, 1, 1],
        },
        {
          name: "d",
          v: [100, 1.5, 1],
        },
        {
          name: "e",
          v: [100, 1.5, 1.5],
        },
        {
          name: "f",
          v: [100, 100, 100],
        },
      ],
      ({ v }) => v,
      { epsilon: 1 }
    );
    expect(clusters).toHaveLength(2);
    expect(clusters[0]).toHaveLength(2);
    expect(clusters[0][0].name).toBe("a");
    expect(clusters[0][1].name).toBe("b");
    expect(clusters[1]).toHaveLength(3);
    expect(clusters[1][0].name).toBe("c");
    expect(clusters[1][1].name).toBe("d");
    expect(clusters[1][2].name).toBe("e");
    expect(noise).toHaveLength(1);
    expect(noise[0].name).toBe("f");
  });
});
