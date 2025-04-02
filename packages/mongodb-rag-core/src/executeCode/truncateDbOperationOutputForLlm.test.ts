import { Document } from "mongodb";
import {
  truncateDbOperationOutputForLlm,
  TruncationOptions,
} from "./databaseMetadata/truncateDbOperationOutputForLlm";

describe("truncateDbOperationOutputForLlm", () => {
  describe("string truncation", () => {
    it("should truncate long strings", () => {
      const doc: Document = {
        title: "This is a very long string that should be truncated",
      };
      const options: TruncationOptions = { maxStringLength: 10 };
      const result = truncateDbOperationOutputForLlm(doc, options);
      expect(result?.title).toBe("This is a ...");
    });

    it("should not truncate short strings", () => {
      const doc: Document = { title: "Short" };
      const options: TruncationOptions = { maxStringLength: 10 };
      const result = truncateDbOperationOutputForLlm(doc, options);
      expect(result.title).toBe("Short");
    });
  });

  describe("array truncation", () => {
    it("should truncate long arrays by showing half at beginning and half at end", () => {
      const doc: Document = {
        tags: ["one", "two", "three", "four", "five", "six", "seven", "eight"],
      };
      const options: TruncationOptions = { maxArrayLength: 4 };
      const result = truncateDbOperationOutputForLlm(doc, options);

      // Should have 2 at beginning, 2 at end, and 1 message in the middle
      expect(result.tags).toHaveLength(5);
      expect(result.tags[0]).toBe("one");
      expect(result.tags[1]).toBe("two");
      expect(result.tags[2]).toBe("...4 items omitted...");
      expect(result.tags[3]).toBe("seven");
      expect(result.tags[4]).toBe("eight");
    });

    it("should handle odd-length maxArrayLength by putting extra element in first half", () => {
      const doc: Document = {
        tags: ["one", "two", "three", "four", "five", "six", "seven", "eight"],
      };
      const options: TruncationOptions = { maxArrayLength: 5 };
      const result = truncateDbOperationOutputForLlm(doc, options);

      // Should have 3 at beginning, 2 at end, and 1 message in the middle
      expect(result.tags).toHaveLength(6);
      expect(result.tags[0]).toBe("one");
      expect(result.tags[1]).toBe("two");
      expect(result.tags[2]).toBe("three");
      expect(result.tags[3]).toBe("...3 items omitted...");
      expect(result.tags[4]).toBe("seven");
      expect(result.tags[5]).toBe("eight");
    });

    it("should not truncate short arrays", () => {
      const doc: Document = { tags: ["one", "two"] };
      const options: TruncationOptions = { maxArrayLength: 3 };
      const result = truncateDbOperationOutputForLlm(doc, options);
      expect(result.tags).toEqual(["one", "two"]);
    });

    it("should handle nested arrays", () => {
      const doc: Document = {
        matrix: [
          [1, 2, 3, 4, 5, 6],
          [7, 8, 9, 10, 11, 12],
          [13, 14, 15, 16, 17, 18],
          [19, 20, 21, 22, 23, 24],
        ],
      };
      const options: TruncationOptions = {
        maxArrayLength: 2,
      };
      const result = truncateDbOperationOutputForLlm(doc, options);

      // Should have 1 at beginning, 1 at end, and 1 message in the middle for outer array
      expect(result.matrix).toHaveLength(3);

      // Inner arrays should also be truncated
      // First inner array should have 1 at beginning, 1 at end, and message
      expect(result.matrix[0]).toHaveLength(3);
      expect(result.matrix[0][0]).toBe(1);
      expect(result.matrix[0][1]).toBe("...4 items omitted...");
      expect(result.matrix[0][2]).toBe(6);

      // Message for skipped arrays
      expect(result.matrix[1]).toBe("...2 items omitted...");

      // Last inner array should be truncated too
      expect(result.matrix[2]).toHaveLength(3);
      expect(result.matrix[2][0]).toBe(19);
      expect(result.matrix[2][1]).toBe("...4 items omitted...");
      expect(result.matrix[2][2]).toBe(24);
    });
  });

  describe("object truncation", () => {
    it("should truncate objects with many keys", () => {
      const doc: Document = {
        key1: "value1",
        key2: "value2",
        key3: "value3",
        key4: "value4",
      };
      const options: TruncationOptions = { maxObjectKeys: 2 };
      const result = truncateDbOperationOutputForLlm(doc, options);
      expect(Object.keys(result)).toHaveLength(3); // 2 keys + "..."
      expect(result["..."]).toBe("2 more keys");
    });

    it("should respect max depth for nested objects", () => {
      const doc: Document = {
        level1: {
          level2: {
            level3: {
              level4: "deep value",
            },
          },
        },
      };
      const options: TruncationOptions = { maxObjectDepth: 2 };
      const result = truncateDbOperationOutputForLlm(doc, options);
      expect(result.level1.level2).toBe("[Object]");
    });
  });

  describe("mixed type handling", () => {
    it("should handle complex nested structures", () => {
      const doc: Document = {
        title: "A very long title that needs truncation",
        tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
        metadata: {
          created: new Date("2025-01-01"),
          author: {
            name: "John Doe",
            favorites: ["one", "two", "three", "four", "five", "six"],
          },
        },
      };
      const options: TruncationOptions = {
        maxStringLength: 15,
        maxArrayLength: 4,
        maxObjectDepth: 2,
        maxObjectKeys: 3,
      };
      const result = truncateDbOperationOutputForLlm(doc, options);

      // Check string truncation
      expect(result.title).toBe("A very long tit...");

      // Check array truncation
      expect(result.tags).toHaveLength(5);
      expect(result.tags[0]).toBe("tag1");
      expect(result.tags[1]).toBe("tag2");
      expect(result.tags[2]).toBe("...4 items omitted...");
      expect(result.tags[3]).toBe("tag7");
      expect(result.tags[4]).toBe("tag8");

      // Check object depth truncation
      expect(result.metadata).toEqual({
        created: new Date("2025-01-01"),
        author: "[Object]",
      });

      // Check object keys truncation - should have title, tags, metadata
      const keys = Object.keys(result).sort();
      expect(keys).toEqual(["metadata", "tags", "title"]);
    });
  });

  describe("special cases", () => {
    it("should handle null and undefined values", () => {
      const doc: Document = {
        nullField: null,
        undefinedField: undefined,
      };
      const result = truncateDbOperationOutputForLlm(doc);
      expect(result.nullField).toBeNull();
      expect(result.undefinedField).toBeUndefined();
    });

    it("should handle empty arrays and objects", () => {
      const doc: Document = {
        emptyArray: [],
        emptyObject: {},
      };
      const result = truncateDbOperationOutputForLlm(doc);
      expect(result.emptyArray).toEqual([]);
      expect(result.emptyObject).toEqual({});
    });

    it("should handle Date objects", () => {
      const date = new Date("2025-01-01");
      const doc: Document = { date };
      const result = truncateDbOperationOutputForLlm(doc);
      expect(result.date).toEqual(date);
    });

    it("should handle null input", () => {
      const result = truncateDbOperationOutputForLlm(null);
      expect(result).toBeNull();
    });
  });

  describe("array of documents", () => {
    it("should handle an array of documents", () => {
      const docs: Document[] = [
        { name: "Document 1", values: [1, 2, 3, 4, 5, 6, 7, 8] },
        { name: "Document 2", values: [9, 10, 11, 12, 13, 14, 15, 16] },
        { name: "Document 3", values: [17, 18, 19, 20, 21, 22, 23, 24] },
        { name: "Document 4", values: [25, 26, 27, 28, 29, 30, 31, 32] },
        { name: "Document 5", values: [33, 34, 35, 36, 37, 38, 39, 40] },
      ];

      const options: TruncationOptions = { maxArrayLength: 3 };
      const result = truncateDbOperationOutputForLlm(
        docs,
        options
      ) as Document[];

      // Should truncate the outer array of documents
      expect(result).toHaveLength(4); // 3 docs + message

      // First two documents should be preserved
      expect(result[0].name).toBe("Document 1");
      expect(result[1].name).toBe("Document 2");

      // Middle should be a message
      expect(result[2]).toBe("...2 items omitted...");

      // Last document should be preserved
      expect(result[3].name).toBe("Document 5");

      // Inner arrays should also be truncated
      expect(result[0].values).toHaveLength(4); // 2 at start, 1 at end, 1 message
      expect(result[0].values[0]).toBe(1);
      expect(result[0].values[1]).toBe(2);
      expect(result[0].values[2]).toBe("...5 items omitted...");
      expect(result[0].values[3]).toBe(8);
    });

    it("should handle empty array of documents", () => {
      const docs: Document[] = [];
      const result = truncateDbOperationOutputForLlm(docs);
      expect(result).toEqual([]);
    });
  });

  describe("default options", () => {
    it("should use default options when none provided", () => {
      const doc: Document = {
        longString: "x".repeat(200),
        longArray: Array.from({ length: 10 }, (_, i) => i),
      };
      const result = truncateDbOperationOutputForLlm(doc);
      expect(result.longString.length).toBe(103); // 100 chars + "..."

      // Default maxArrayLength is 6, so we should have 3 at beginning, 3 at end, and message
      expect(result.longArray).toHaveLength(7);
      expect(result.longArray[0]).toBe(0);
      expect(result.longArray[1]).toBe(1);
      expect(result.longArray[2]).toBe(2);
      expect(result.longArray[3]).toBe("...4 items omitted...");
      expect(result.longArray[4]).toBe(7);
      expect(result.longArray[5]).toBe(8);
      expect(result.longArray[6]).toBe(9);
    });
  });
});
