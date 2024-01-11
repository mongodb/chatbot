import { clusterize } from "./clusterize";

describe("clusterize", () => {
  it("clusterizes nodes", () => {
    const { clusters, noise } = clusterize(
      // Each element in this dataset represents a node with a name and a
      // 3-dimensional position vector ("v")
      [
        {
          name: "a",
          v: [1, 1.5, 1],
        },
        {
          name: "b",
          v: [1, 1, 1], // Close to A
        },
        {
          name: "c",
          v: [100, 1, 1], // Not close to A or B (~100 units away on X axis)
        },
        {
          name: "d",
          v: [100, 1.5, 1], // Close to C
        },
        {
          name: "e",
          v: [100, 1.5, 1.5], // Close to C and D
        },
        {
          name: "f",
          v: [100, 100, 100], // Not close to any other node
        },
      ],
      ({ v }) => v, // Getter function returns vector field from data object
      { epsilon: 1 }
    );

    // Expect clusters [a, b], [c, d, e] and noise f
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
