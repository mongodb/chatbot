import type { DatabaseExecutionResult } from "mongodb-rag-core/executeCode";
import { Score } from "autoevals";
import {
  NonEmptyArrayOutput,
  SearchOperatorUsed,
  makeNdcgAtK,
  ndcgMatchFunc,
} from "./atlasSearch";
import { ObjectId } from "mongodb-rag-core/mongodb";

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

    test("returns 0 when array contains null items", () => {
      const score = NonEmptyArrayOutput({
        output: makeOutput({ result: [null, { id: 1 }] }),
      } as any);
      expect(score).toEqual({
        name: "NonEmptyArrayOutput",
        score: 0,
        metadata: {
          isArray: true,
          hasItems: true,
          nonEmptyItems: false,
        },
      });
    });

    test("returns 0 when array contains undefined items", () => {
      const score = NonEmptyArrayOutput({
        output: makeOutput({ result: [undefined, { id: 1 }] }),
      });
      expect(score).toEqual({
        name: "NonEmptyArrayOutput",
        score: 0,
        metadata: {
          isArray: true,
          hasItems: true,
          nonEmptyItems: false,
        },
      });
    });

    test("returns 0 when array contains empty strings", () => {
      const score = NonEmptyArrayOutput({
        output: makeOutput({ result: ["", { id: 1 }] }),
      });
      expect(score).toEqual({
        name: "NonEmptyArrayOutput",
        score: 0,
        metadata: {
          isArray: true,
          hasItems: true,
          nonEmptyItems: false,
        },
      });
    });

    test("returns 1 when array contains valid non-object items", () => {
      const scoreWithString = NonEmptyArrayOutput({
        output: makeOutput({ result: ["string", { id: 1 }] }),
      });
      expect(scoreWithString).toEqual({
        name: "NonEmptyArrayOutput",
        score: 1,
        metadata: {
          isArray: true,
          hasItems: true,
          nonEmptyItems: true,
        },
      });

      const scoreWithNumber = NonEmptyArrayOutput({
        output: makeOutput({ result: [42, { id: 1 }] }),
      });
      expect(scoreWithNumber).toEqual({
        name: "NonEmptyArrayOutput",
        score: 1,
        metadata: {
          isArray: true,
          hasItems: true,
          nonEmptyItems: true,
        },
      });
    });

    test("returns 0 when array contains empty objects", () => {
      const score = NonEmptyArrayOutput({
        output: makeOutput({ result: [{}, { id: 1 }] }),
      });
      expect(score).toEqual({
        name: "NonEmptyArrayOutput",
        score: 0,
        metadata: {
          isArray: true,
          hasItems: true,
          nonEmptyItems: false,
        },
      });
    });

    test("returns 1 when array contains only valid non-empty objects", () => {
      const score = NonEmptyArrayOutput({
        output: makeOutput({ result: [{ id: 1 }, { name: "test" }] }),
      });
      expect(score).toEqual({
        name: "NonEmptyArrayOutput",
        score: 1,
        metadata: {
          isArray: true,
          hasItems: true,
          nonEmptyItems: true,
        },
      });
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

  describe("ndcgMatchFunc", () => {
    test("returns true when _id is the same string", () => {
      const a = { _id: "1" };
      const b = { _id: "1" };
      expect(ndcgMatchFunc(a, b)).toBe(true);
      expect(ndcgMatchFunc(b, a)).toBe(true);
    });

    test("returns true when _id is the same number", () => {
      const a = { _id: 1 };
      const b = { _id: 1 };
      expect(ndcgMatchFunc(a, b)).toBe(true);
      expect(ndcgMatchFunc(b, a)).toBe(true);
    });

    test("returns true when _id is the same ObjectId", () => {
      const oidString = "507f1f77bcf86cd799439011";
      const a = { _id: new ObjectId(oidString) };
      const b = { _id: new ObjectId(oidString) };
      expect(ndcgMatchFunc(a, b)).toBe(true);
      expect(ndcgMatchFunc(b, a)).toBe(true);
    });
    test("returns true when _id ObjectId matches same string", () => {
      const oidString = "507f1f77bcf86cd799439011";
      const a = { _id: new ObjectId(oidString) };
      const b = { _id: oidString };
      expect(ndcgMatchFunc(a, b)).toBe(true);
      expect(ndcgMatchFunc(b, a)).toBe(true);
    });
    test("returns false when _id is different", () => {
      const aStr = { _id: "1" };
      const bStr = { _id: "2" };
      expect(ndcgMatchFunc(aStr, bStr)).toBe(false);
      expect(ndcgMatchFunc(bStr, aStr)).toBe(false);

      const aNumber = { _id: 1 };
      const bNumber = { _id: 2 };
      expect(ndcgMatchFunc(aNumber, bNumber)).toBe(false);
      expect(ndcgMatchFunc(bNumber, aNumber)).toBe(false);

      const aOid = { _id: new ObjectId("507f1f77bcf86cd799439011") };
      const bOid = { _id: new ObjectId() };
      expect(ndcgMatchFunc(aOid, bOid)).toBe(false);
      expect(ndcgMatchFunc(bOid, aOid)).toBe(false);

      const bOidLikeString = { _id: "507f1f77bcf86cd799439012" };
      expect(ndcgMatchFunc(aOid, bOidLikeString)).toBe(false);
      expect(ndcgMatchFunc(bOidLikeString, aOid)).toBe(false);
    });

    test("returns true when id is the same", () => {
      const aStr = { id: "1" };
      const bStr = { id: "1" };
      expect(ndcgMatchFunc(aStr, bStr)).toBe(true);
      expect(ndcgMatchFunc(bStr, aStr)).toBe(true);

      const aNumber = { id: 1 };
      const bNumber = { id: 1 };
      expect(ndcgMatchFunc(aNumber, bNumber)).toBe(true);
      expect(ndcgMatchFunc(bNumber, aNumber)).toBe(true);
    });

    test("returns false when id is different", () => {
      const aStr = { id: "1" };
      const bStr = { id: "2" };
      expect(ndcgMatchFunc(aStr, bStr)).toBe(false);
      expect(ndcgMatchFunc(bStr, aStr)).toBe(false);

      const aNumber = { id: 1 };
      const bNumber = { id: 2 };
      expect(ndcgMatchFunc(aNumber, bNumber)).toBe(false);
      expect(ndcgMatchFunc(bNumber, aNumber)).toBe(false);
    });

    test("returns false when neither _id nor id is present", () => {
      const a = { other: "a" };
      const b = { other: "a" };
      expect(ndcgMatchFunc(a, b)).toBe(false);
      expect(ndcgMatchFunc(b, a)).toBe(false);
    });
  });

  describe("NdcgAtK", () => {
    test("returns 0 with error metadata when result or expected are not arrays", () => {
      const k = 5;
      const scorer = makeNdcgAtK({ k });

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
      const scorer = makeNdcgAtK({ k });

      const result = [{ _id: "a" }, { _id: "b" }, { _id: "c" }];
      const expected = [{ _id: "a" }, { _id: "x" }, { _id: "y" }];
      const out = scorer({
        output: makeOutput({ result }),
        expected,
      } as any) as unknown as Score;

      expect(out.name).toBe(`NDCG@${k}`);
      expect(out.score).toBeGreaterThan(0);
    });
  });
});
