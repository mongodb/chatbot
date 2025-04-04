import {
  fuzzyClusterItems,
  findLargestCluster,
  getClusterElementsFromIndexes,
} from "./fuzzyClusterItems";

describe("fuzzyClusterItems", () => {
  // Test with simple number array and exact matching
  it("should cluster identical numbers", () => {
    const items = [1, 2, 1, 3, 2, 4];
    const fuzzyMatch = (a: number, b: number) => a === b;

    const clusters = fuzzyClusterItems(items, fuzzyMatch);

    // Expected clusters: [[0, 2], [1, 4], [3], [5]]
    // Where: [0, 2] = indices of value 1
    //        [1, 4] = indices of value 2
    //        [3] = index of value 3
    //        [5] = index of value 4
    expect(clusters).toHaveLength(4);
    expect(clusters).toContainEqual([0, 2]);
    expect(clusters).toContainEqual([1, 4]);
    expect(clusters).toContainEqual([3]);
    expect(clusters).toContainEqual([5]);
  });

  // Test with string array and custom fuzzy matching
  it("should cluster strings based on custom fuzzy matching", () => {
    const items = ["apple", "banana", "apricot", "orange", "berry"];
    // Fuzzy match: strings that start with the same letter
    const fuzzyMatch = (a: string, b: string) => a[0] === b[0];

    const clusters = fuzzyClusterItems(items, fuzzyMatch);

    // Expected clusters: [[0, 2], [1, 4], [3]]
    // Where: [0, 2] = indices of strings starting with 'a'
    //        [1, 4] = indices of strings starting with 'b'
    //        [3] = index of string starting with 'o'
    expect(clusters).toHaveLength(3);
    expect(clusters).toContainEqual([0, 2]);
    expect(clusters).toContainEqual([1, 4]);
    expect(clusters).toContainEqual([3]);
  });

  // Test with object array and property-based matching
  it("should cluster objects based on property matching", () => {
    const items = [
      { id: 1, category: "fruit" },
      { id: 2, category: "vegetable" },
      { id: 3, category: "fruit" },
      { id: 4, category: "dairy" },
      { id: 5, category: "vegetable" },
    ];
    // Match objects with the same category
    const fuzzyMatch = (a: { category: string }, b: { category: string }) =>
      a.category === b.category;

    const clusters = fuzzyClusterItems(items, fuzzyMatch);

    // Expected clusters: [[0, 2], [1, 4], [3]]
    // Where: [0, 2] = indices of 'fruit' category
    //        [1, 4] = indices of 'vegetable' category
    //        [3] = index of 'dairy' category
    expect(clusters).toHaveLength(3);
    expect(clusters).toContainEqual([0, 2]);
    expect(clusters).toContainEqual([1, 4]);
    expect(clusters).toContainEqual([3]);
  });

  // Test with numeric threshold for fuzzy matching
  it("should cluster numbers based on proximity threshold", () => {
    const items = [10, 12, 25, 11, 26, 40];
    // Fuzzy match: numbers within 2 units of each other
    const fuzzyMatch = (a: number, b: number) => Math.abs(a - b) <= 2;

    const clusters = fuzzyClusterItems(items, fuzzyMatch);

    // Expected clusters: [[0, 1, 3], [2, 4], [5]]
    // Where: [0, 1, 3] = indices of numbers 10, 12, 11 (all within 2 units)
    //        [2, 4] = indices of numbers 25, 26 (within 2 units)
    //        [5] = index of number 40 (not within 2 units of any other)
    expect(clusters).toHaveLength(3);
    expect(clusters).toContainEqual([0, 1, 3]);
    expect(clusters).toContainEqual([2, 4]);
    expect(clusters).toContainEqual([5]);
  });

  // Test with empty array
  it("should handle empty arrays", () => {
    const items: number[] = [];
    const fuzzyMatch = (a: number, b: number) => a === b;

    const clusters = fuzzyClusterItems(items, fuzzyMatch);

    expect(clusters).toHaveLength(0);
    expect(clusters).toEqual([]);
  });

  // Test with single item array
  it("should handle single item arrays", () => {
    const items = [42];
    const fuzzyMatch = (a: number, b: number) => a === b;

    const clusters = fuzzyClusterItems(items, fuzzyMatch);

    expect(clusters).toHaveLength(1);
    expect(clusters).toEqual([[0]]);
  });

  // Test with no matches
  it("should handle no matches between items", () => {
    const items = [1, 2, 3, 4, 5];
    // No matches - always return false
    const fuzzyMatch = () => false;

    const clusters = fuzzyClusterItems(items, fuzzyMatch);

    // Each item should be in its own cluster
    expect(clusters).toHaveLength(5);
    expect(clusters).toEqual([[0], [1], [2], [3], [4]]);
  });

  // Test with all matches
  it("should handle all items matching", () => {
    const items = [1, 2, 3, 4, 5];
    // All match - always return true
    const fuzzyMatch = () => true;

    const clusters = fuzzyClusterItems(items, fuzzyMatch);

    // All items should be in the first cluster
    expect(clusters).toHaveLength(1);
    expect(clusters).toEqual([[0, 1, 2, 3, 4]]);
  });
});

describe("findLargestCluster", () => {
  it("should find the cluster with the most elements", () => {
    const clusters = [[0, 2], [1, 4, 6, 8], [3, 5], [7]];
    const largestCluster = findLargestCluster(clusters);

    expect(largestCluster).toEqual(clusters[1]);
  });

  it("should return the first cluster when multiple clusters have the same size", () => {
    const clusters = [
      [0, 2],
      [1, 4],
      [3, 5],
    ];
    const largestCluster = findLargestCluster(clusters);

    // All clusters have size 2, so it should return the first one
    expect(largestCluster).toEqual(clusters[0]);
  });

  it("should handle a single cluster", () => {
    const clusters = [[0, 1, 2, 3]];
    const largestCluster = findLargestCluster(clusters);

    expect(largestCluster).toEqual(clusters[0]);
  });

  it("should throw if empty clusters array", () => {
    expect(() => {
      findLargestCluster([]);
    }).toThrow();
  });
});

describe("getClusterElementsFromIndexes", () => {
  it("should retrieve elements from the original array by their indexes", () => {
    const items = ["apple", "banana", "cherry", "date", "elderberry"];
    const indexes = [0, 2, 4];

    const elements = getClusterElementsFromIndexes(items, indexes);

    expect(elements).toEqual(["apple", "cherry", "elderberry"]);
  });

  it("should return an empty array when indexes is empty", () => {
    const items = ["apple", "banana", "cherry"];
    const indexes: number[] = [];

    const elements = getClusterElementsFromIndexes(items, indexes);

    expect(elements).toEqual([]);
  });

  it("should handle out-of-bounds indexes gracefully", () => {
    const items = ["apple", "banana", "cherry"];
    const indexes = [0, 5]; // 5 is out of bounds

    expect(() => getClusterElementsFromIndexes(items, indexes)).toThrow();
  });
});
