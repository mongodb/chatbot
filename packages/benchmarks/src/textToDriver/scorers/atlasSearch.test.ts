import type { DatabaseExecutionResult } from "mongodb-rag-core/executeCode";
import { Score } from "autoevals";
import {
  NonEmptyArrayOutput,
  SearchOperatorUsed,
  makeNdcgAtK,
} from "./atlasSearch";

describe("atlasSearch scorers", () => {
  function makeOutput(
    partial: Partial<DatabaseExecutionResult> & { generatedCode?: string }
  ) {
    const execution: DatabaseExecutionResult = {
      result: null,
      executionTimeMs: null,
      ...partial,
    } as DatabaseExecutionResult;

    return {
      generatedCode: partial.generatedCode ?? "",
      execution,
    };
  }

  describe("NonEmptyArrayOutput", () => {
    test("returns 0 when result is null", () => {
      const score = NonEmptyArrayOutput({
        output: makeOutput({ result: null }),
      } as any);
      expect(score).toEqual({ name: "NonEmptyArrayOutput", score: 0 });
    });

    test("returns 0 when result is an empty array", () => {
      const score = NonEmptyArrayOutput({
        output: makeOutput({ result: [] }),
      } as any);
      expect(score).toEqual({ name: "NonEmptyArrayOutput", score: 0 });
    });

    test("returns 1 when result is a non-empty array", () => {
      const score = NonEmptyArrayOutput({
        output: makeOutput({ result: [{ id: 1 }] }),
      } as any);
      expect(score).toEqual({ name: "NonEmptyArrayOutput", score: 1 });
    });

    test("returns 0 when result is a non-array non-null value", () => {
      const scoreNumber = NonEmptyArrayOutput({
        output: makeOutput({ result: 42 as any }),
      } as any);
      expect(scoreNumber).toEqual({ name: "NonEmptyArrayOutput", score: 0 });

      const scoreObject = NonEmptyArrayOutput({
        output: makeOutput({ result: { a: 1 } as any }),
      } as any);
      expect(scoreObject).toEqual({ name: "NonEmptyArrayOutput", score: 0 });
    });
  });

  describe("SearchOperatorUsed", () => {
    test("returns 1 when $search is used", () => {
      const score = SearchOperatorUsed({
        output: makeOutput({
          generatedCode: "db.c.aggregate([{ $search: {} }])",
        }),
      } as any);
      expect(score).toEqual({ name: "SearchOperatorUsed", score: 1 });
    });

    test("returns 1 when $vectorSearch is used", () => {
      const score = SearchOperatorUsed({
        output: makeOutput({
          generatedCode: "db.c.aggregate([{ $vectorSearch: {} }])",
        }),
      } as any);
      expect(score).toEqual({ name: "SearchOperatorUsed", score: 1 });
    });

    test("returns 0.5 when only $knnBeta is used", () => {
      const score = SearchOperatorUsed({
        output: makeOutput({
          generatedCode: "db.c.aggregate([{ $knnBeta: {} }])",
        }),
      } as any);
      expect(score).toEqual({ name: "SearchOperatorUsed", score: 0.5 });
    });

    test("returns 0 when neither $search nor $knnBeta is used", () => {
      const score = SearchOperatorUsed({
        output: makeOutput({ generatedCode: "db.c.find({})" }),
      } as any);
      expect(score).toEqual({ name: "SearchOperatorUsed", score: 0 });
    });
  });

  describe("NdcgAtK", () => {
    test("returns 0 with error metadata when result or expected are not arrays", () => {
      const k = 5;
      const match = (a: unknown, b: unknown) => a === b;
      const scorer = makeNdcgAtK({ k, matchFunc: match });

      const out1 = scorer({
        output: makeOutput({ result: 1 as any }),
        expected: [1, 2, 3] as any,
      } as any) as unknown as Score;
      expect(out1.name).toBe(`NDCG@${k}`);
      expect(out1.score).toBe(0);
      expect(out1.metadata).toEqual({
        error: "Expected result and expected result to be arrays",
      });

      const out2 = scorer({
        output: makeOutput({ result: [1, 2, 3] as any }),
        expected: 1 as any,
      } as any) as unknown as Score;
      expect(out2.name).toBe(`NDCG@${k}`);
      expect(out2.score).toBe(0);
      expect(out2.metadata).toEqual({
        error: "Expected result and expected result to be arrays",
      });
    });

    test("calls binaryNdcgAtK with correct args and returns its score", () => {
      const k = 3;
      const match = jest.fn((a: string, b: string) => a === b);
      const scorer = makeNdcgAtK({ k, matchFunc: match as any });

      const result = ["a", "b", "c"];
      const expected = ["a", "x", "y"];
      const out = scorer({
        output: makeOutput({ result }),
        expected,
      } as any) as unknown as Score;

      expect(out.name).toBe(`NDCG@${k}`);
      expect(out.score).toBeGreaterThan(0);
    });
  });
});
