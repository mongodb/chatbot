import { precisionAtK } from "./precisionAtK";
import { MatchFunc } from "./MatchFunc";

const matchFunc: MatchFunc<string> = (a: string, b: string) => a === b;
const testItems = ["item1", "item2", "item3", "item4", "item5", "item6"];

describe("precisionAtK", () => {
  test("All retrieved items are relevant", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const precision = precisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(precision).toBe(1);
  });

  test("No relevant items retrieved", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(3);
    const k = 3;

    const precision = precisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(precision).toBe(0);
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

    const precision = precisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(precision).toBeCloseTo(0.6, 5);
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

    const precision = precisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(precision).toBeCloseTo(2 / 3, 5);
  });

  test("k is zero", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 0;

    expect(() =>
      precisionAtK(relevantItems, retrievedItems, matchFunc, k)
    ).toThrow();
  });

  test("No relevant items in the list", () => {
    const relevantItems: string[] = [];
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const precision = precisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(precision).toBe(0);
  });

  test("Empty retrieved items", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems: string[] = [];
    const k = 3;

    const precision = precisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(precision).toBe(0);
  });

  test("k greater than retrieved items length", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [testItems[1], testItems[3]];
    const k = 5;

    const precision = precisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(precision).toBeCloseTo(0.5, 5);
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

    const precision = precisionAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(precision).toBeCloseTo(0.6, 5);
  });
});
