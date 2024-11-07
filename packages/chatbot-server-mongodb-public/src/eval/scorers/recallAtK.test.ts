// Import the function to be tested
import { recallAtK } from "./recallAtK";
import { MatchFunc } from "./MatchFunc";

const matchFunc: MatchFunc<string> = (a: string, b: string) => a === b;
const testItems = ["item1", "item2", "item3", "item4", "item5", "item6"];

describe("recallAtK", () => {
  test("All retrieved items are relevant", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(recall).toBe(1);
  });

  test("No relevant items retrieved", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(3);
    const k = 3;

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(recall).toBe(0);
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

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);
    // Expected recall:
    // Relevant items found in retrievedItems at ranks 1, 3, and 5.
    // Recall@K = 3 / 3 = 1
    expect(recall).toBe(1);
  });

  test("k is less than retrieved items length", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [
      testItems[1],
      testItems[3],
      testItems[0],
      // only consider until here
      testItems[4],
      testItems[2],
    ];
    const k = 3;

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);
    // Only consider top 3 retrieved items
    // Recall@K = 2 / 3 ≈ 0.6667
    expect(recall).toBeCloseTo(2 / 3, 5);
  });

  test("k is zero", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 0;

    expect(() =>
      recallAtK(relevantItems, retrievedItems, matchFunc, k)
    ).toThrow();
  });

  test("No relevant items in the list", () => {
    const relevantItems: string[] = [];
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(recall).toBe(0);
  });

  test("Empty retrieved items", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems: string[] = [];
    const k = 3;

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(recall).toBe(0);
  });

  test("k greater than retrieved items length", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [testItems[1], testItems[3]];
    const k = 5;

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);
    // Recall@K = 1 / 3 ≈ 0.3333
    expect(recall).toBeCloseTo(1 / 3, 5);
  });

  test("All retrieved items are non-relevant", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(3);
    const k = 5;

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(recall).toBe(0);
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

    const recall = recallAtK(relevantItems, retrievedItems, matchFunc, k);

    // Expected Recall:
    // Matches are counted only once for each relevant item.
    // Recall@K = 3 / 3 = 1
    expect(recall).toBe(1);
  });
});
