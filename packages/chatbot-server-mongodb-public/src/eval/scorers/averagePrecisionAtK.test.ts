// Import the function to be tested
import { averagePrecisionAtK } from "./averagePrecisionAtK";
import { MatchFunc } from "./MatchFunc";

const matchFunc: MatchFunc<string> = (a: string, b: string) => a === b;
const testItems = ["item1", "item2", "item3", "item4", "item5", "item6"];
describe("averagePrecisionAtK", () => {
  test("All retrieved items are relevant", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ap).toBe(1);
  });

  test("No relevant items retrieved", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(3);
    const k = 3;

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ap).toBe(0);
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

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);

    // Manually calculate expected AP:
    // Relevant items found at ranks 1, 3, and 5
    // Precision at rank 1: 1/1 = 1
    // Precision at rank 3: 2/3 ≈ 0.6667
    // Precision at rank 5: 3/5 = 0.6
    // Average Precision = (1 + 0.6667 + 0.6) / 3 ≈ 0.7556

    const expectedAP = (1 + 2 / 3 + 0.6) / 3;
    expect(ap).toBeCloseTo(expectedAP, 5);
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

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);

    // Only consider top 3 retrieved items
    // Relevant items at ranks 1 and 3
    // Precision at rank 1: 1/1 = 1
    // Precision at rank 3: 2/3 ≈ 0.6667
    // Average Precision = (1 + 0.6667) / 3 ≈ 0.5556

    const expectedAP = (1 + 2 / 3) / 3;
    expect(ap).toBeCloseTo(expectedAP, 5);
  });

  test("k is zero", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 0;

    expect(() =>
      averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k)
    ).toThrow();
  });

  test("No relevant items in the list", () => {
    const relevantItems: string[] = [];
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ap).toBe(0);
  });

  test("Empty retrieved items", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems: string[] = [];
    const k = 3;

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ap).toBe(0);
  });

  test("k greater than retrieved items length", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [testItems[1], testItems[3]];
    const k = 5;

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);

    // Only two retrieved items, relevant item at rank 1
    // Precision at rank 1: 1/1 = 1
    // Average Precision = 1 / 3 ≈ 0.3333 (since total relevant items is 3)

    const expectedAP = 1 / 3;
    expect(ap).toBeCloseTo(expectedAP, 5);
  });

  test("All retrieved items are non-relevant", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(3);
    const k = 5;

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ap).toBe(0);
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

    const ap = averagePrecisionAtK(relevantItems, retrievedItems, matchFunc, k);

    // Expected AP calculation:
    // Precision at ranks where unique relevant items appear:
    // Rank 1 (item1): Precision = 1/1 = 1
    // Rank 3 (item2): Precision = 2/3 ≈ 0.6667
    // Rank 5 (item3): Precision = 3/5 = 0.6
    // Average Precision = (1 + 0.6667 + 0.6) / 3 ≈ 0.7556
    const expectedAP = (1 + 2 / 3 + 0.6) / 3;
    expect(ap).toBeCloseTo(expectedAP, 4);
  });
});
