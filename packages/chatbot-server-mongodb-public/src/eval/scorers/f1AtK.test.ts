import { f1AtK } from "./f1AtK";
import { MatchFunc } from "./MatchFunc";

// Mock match function to compare items directly
const matchFunc: MatchFunc<string> = (a: string, b: string) => a === b;

// Test items
const testItems = ["item1", "item2", "item3", "item4", "item5", "item6"];

describe("f1AtK", () => {
  test("All retrieved items are relevant", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    expect(f1).toBe(1); // Both precision and recall are 1, so F1 should be 1
  });

  test("No relevant items retrieved", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(3);
    const k = 3;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    expect(f1).toBe(0); // Precision and recall are 0, so F1 should be 0
  });

  test("Some relevant items retrieved", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [
      testItems[1],
      testItems[3],
      testItems[0],
      testItems[4],
      testItems[2],
    ];
    const k = 5;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    // Precision = 3/5 = 0.6
    // Recall = 3/3 = 1
    // F1 = 2 * (Precision * Recall) / (Precision + Recall) ≈ 0.75
    expect(f1).toBeCloseTo(0.75, 5);
  });

  test("k is less than retrieved items length", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [
      testItems[1],
      testItems[3],
      testItems[0],
      testItems[4],
      testItems[2],
    ];
    const k = 3;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    // Precision@3 = 2/3 ≈ 0.6667
    // Recall@3 = 2/3 ≈ 0.6667
    // F1 ≈ 0.6667
    expect(f1).toBeCloseTo(0.6667, 4);
  });

  test("k is zero", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 0;

    expect(() => f1AtK(relevantItems, retrievedItems, matchFunc, k)).toThrow();
  });

  test("No relevant items in the list", () => {
    const relevantItems: string[] = [];
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    expect(f1).toBe(0); // No relevant items, so recall is 0, making F1 0
  });

  test("Empty retrieved items", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems: string[] = [];
    const k = 3;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    expect(f1).toBe(0); // No retrieved items, so precision is 0, making F1 0
  });

  test("k greater than retrieved items length", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [testItems[1], testItems[3]];
    const k = 5;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    // Precision@5 = 1/5 = 0.2
    // Recall = 1/3 ≈ 0.3333
    // F1 ≈ 0.25
    expect(f1).toBeCloseTo(0.4, 5);
  });

  test("All retrieved items are non-relevant", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(3);
    const k = 5;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    expect(f1).toBe(0); // Precision and recall are 0, so F1 should be 0
  });

  test("Retrieved items contain duplicates", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [
      testItems[0],
      testItems[0],
      testItems[1],
      testItems[1],
      testItems[2],
    ];
    const k = 5;

    const f1 = f1AtK(relevantItems, retrievedItems, matchFunc, k);
    // Precision@5 = 3/5 = 0.6
    // Recall = 3/3 = 1
    // F1 ≈ 0.75
    expect(f1).toBeCloseTo(0.75, 5);
  });
});
