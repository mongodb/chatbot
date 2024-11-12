import { binaryNdcgAtK } from "./binaryNdcgAtK";
import { MatchFunc } from "./MatchFunc";

describe("binaryNdcgAtK", () => {
  // Simple match function for primitives
  const matchFunc: MatchFunc<string> = (a: string, b: string) => a === b;

  const testItems = ["item1", "item2", "item3", "item4", "item5", "item6"];

  test("All retrieved items are relevant", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ndcg).toBeCloseTo(1.0, 5); // NDCG should be 1 when all relevant items are retrieved perfectly
  });

  test("No relevant items retrieved", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(3, 6);
    const k = 3;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ndcg).toBe(0); // NDCG should be 0 when no relevant items are retrieved
  });

  test("All relevant items retrieved, non-ideal order", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [
      testItems[0],
      testItems[1],
      testItems[3],
      testItems[4],
      testItems[2],
    ];
    const k = 5;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);

    // Relevance scores: [1, 1, 0, 0, 1]
    // DCG calculation:
    const dcg =
      1 / Math.log2(1 + 1) +
      1 / Math.log2(2 + 1) +
      0 +
      0 +
      1 / Math.log2(5 + 1);

    // Ideal DCG:
    // Ideal relevance scores: [1, 1, 1, 0, 0]
    const idealDcg =
      1 / Math.log2(1 + 1) +
      1 / Math.log2(2 + 1) +
      1 / Math.log2(3 + 1) +
      0 +
      0;

    const ndcgExpected = dcg / idealDcg;

    expect(ndcg).toBeCloseTo(ndcgExpected, 3);
  });

  test("All relevant items retrieved", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [
      testItems[2],
      testItems[1],
      testItems[0],
      testItems[3],
      testItems[5],
    ];
    const k = 5;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);

    // Relevance scores: [1, 1, 1, 0, 0]
    // Since all relevant items are retrieved in top positions, NDCG should be 1
    expect(ndcg).toBeCloseTo(1.0, 5);
  });

  test("k is less than retrieved items length", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [
      testItems[3],
      testItems[1],
      testItems[2],
      testItems[0],
      testItems[4],
    ];

    const k = 3;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);

    // Relevance scores (top 3): [0, 1, 1]
    // DCG and Ideal DCG calculations yield NDCG less than 1

    expect(ndcg).toBeGreaterThan(0);
    expect(ndcg).toBeLessThan(1);
  });

  test("k is not positive integer", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = testItems.slice(0, 3);
    const k = 0;

    expect(() =>
      binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k)
    ).toThrow();
  });

  test("No relevant items in the list", () => {
    const relevantItems: string[] = [];
    const retrievedItems = testItems.slice(0, 3);
    const k = 3;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ndcg).toBe(0); // No relevant items, so NDCG is 0
  });

  test("Empty retrieved items", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems: string[] = [];
    const k = 3;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);
    expect(ndcg).toBe(0); // No retrieved items, so NDCG is 0
  });

  test("k greater than retrieved items length", () => {
    const relevantItems = testItems.slice(0, 3);
    const retrievedItems = [testItems[0], testItems[3]];

    const k = 5;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);

    // NDCG should be calculated based on available retrieved items

    // Relevance scores: [1, 0]
    const dcg = 1 / Math.log2(1 + 1) + 0 + 0;
    // Ideal DCG: [1, 1, 0]
    const idealDcg =
      1 / Math.log2(1 + 1) + 1 / Math.log2(2 + 1) + 1 / Math.log2(3 + 1);
    const expectedNdcg = dcg / idealDcg;
    expect(ndcg).toBeCloseTo(expectedNdcg, 3);
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

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);

    // Even with duplicates, relevant items are matched once
    // Relevance scores: [1, 0, 1, 0, 1]
    // DCG calculation:
    const dcg =
      1 / Math.log2(1 + 1) +
      0 +
      1 / Math.log2(3 + 1) +
      0 +
      1 / Math.log2(5 + 1);

    // Ideal DCG:
    // Ideal relevance scores: [1, 1, 1, 0, 0]
    const idealDcg =
      1 / Math.log2(1 + 1) +
      1 / Math.log2(2 + 1) +
      1 / Math.log2(3 + 1) +
      0 +
      0;

    const ndcgExpected = dcg / idealDcg;

    expect(ndcg).toBeCloseTo(ndcgExpected, 3);
  });

  test("Retrieved items with non-relevant duplicates", () => {
    const relevantItems = [testItems[0], testItems[1], testItems[2]];
    const retrievedItems = [
      testItems[3],
      testItems[3],
      testItems[2],
      testItems[4],
      testItems[2],
    ];
    const k = 5;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);

    // Actual DCG:
    // Relevance scores: [0, 0, 1, 0, 0]
    const dcg = 0 + 0 + 1 / Math.log2(3 + 1) + 0 + 0;
    // Ideal DCG:
    // Ideal relevance scores: [1, 1, 1, 0, 0]
    const idealDcg =
      1 / Math.log2(1 + 1) +
      1 / Math.log2(2 + 1) +
      1 / Math.log2(3 + 1) +
      0 +
      0;
    const expectedNdcg = dcg / idealDcg;
    expect(ndcg).toBeCloseTo(expectedNdcg, 3);
  });

  test("Fewer retrieved relevant than total relevant", () => {
    const relevantItems = testItems.slice(0, 5);
    const retrievedItems = testItems.slice(0, 2);
    const k = 5;

    const ndcg = binaryNdcgAtK(relevantItems, retrievedItems, matchFunc, k);

    // Relevance scores: [1, 1, 0, 0, 0]
    // DCG calculation:
    const dcg = 1 / Math.log2(1 + 1) + 1 / Math.log2(2 + 1);

    // Ideal DCG:
    // Ideal relevance scores: [1, 1, 1, 1, 1]
    const idealDcg =
      1 / Math.log2(1 + 1) +
      1 / Math.log2(2 + 1) +
      1 / Math.log2(3 + 1) +
      1 / Math.log2(4 + 1) +
      1 / Math.log2(5 + 1);

    const ndcgExpected = dcg / idealDcg;

    expect(ndcg).toBeCloseTo(ndcgExpected, 3);
  });
});
