import {
  getOutputShape,
  getVerySimplifiedSchema,
} from "./getVerySimplifiedSchema";

describe("getOutputShape", () => {
  it("should return JSON string of schema for arrays", async () => {
    const testArray = [
      { name: "test", age: 30 },
      { name: "test2", age: 40 },
    ];

    const result = await getOutputShape(testArray);
    console.log(result);
    expect(result).toContain("name");
    expect(result).toContain("age");
    expect(result).toContain("Array of objects with shape");
  });
  it("should handle empty arrays", async () => {
    const result = await getOutputShape([]);
    expect(result).toBe("empty array: []");
  });

  it("should handle single objects by wrapping them in an array", async () => {
    const testObject = { name: "test", age: 30 };
    const result = await getOutputShape(testObject);
    expect(result).toContain("name");
    expect(result).toContain("age");
    expect(result).toContain("Single object with shape");
  });

  it('should return "string" for string values', async () => {
    const result = await getOutputShape("test string");
    expect(result).toBe("string");
  });

  it('should return "number" for number values', async () => {
    const result = await getOutputShape(42);
    expect(result).toBe("number");
  });

  it('should return "boolean" for boolean values', async () => {
    const result = await getOutputShape(true);
    expect(result).toBe("boolean");
  });

  it('should return "null" for null values', async () => {
    const result = await getOutputShape(null);
    expect(result).toBe("null");
  });

  it('should return "undefined" for undefined values', async () => {
    const result = await getOutputShape(undefined);
    expect(result).toBe("undefined");
  });

  it('should return "unknown" for any other type', async () => {
    const result = await getOutputShape(Symbol("test"));
    expect(result).toBe("unknown");
  });

  it("should handle complex nested objects", async () => {
    const complexObject = {
      name: "test",
      address: {
        street: "123 Main St",
        city: "Testville",
      },
      tags: ["tag1", "tag2"],
    };
    const result = await getOutputShape(complexObject);
    expect(result).toContain("name");
    expect(result).toContain("address");
    expect(result).toContain("tags");
    expect(result).toContain("street");
    expect(result).toContain("city");
  });
});

describe("getVerySimplifiedSchema", () => {
  it("should handle a simple object schema", async () => {
    const result = await getVerySimplifiedSchema({ name: "test", age: 30 });
    expect(result).toEqual({
      type: "Document",
      properties: { name: "String", age: "Number" },
    });
  });

  it("should handle empty arrays", async () => {
    const result = await getVerySimplifiedSchema([]);
    expect(result).toEqual({ type: "Array", $metadata: { emptyArray: true } });
  });
  it("should handle empty objects", async () => {
    const result = await getVerySimplifiedSchema({});
    expect(result).toEqual({ type: "Document", properties: {} });
  });
  it("should handle boolean", async () => {
    const result = await getVerySimplifiedSchema(true);
    expect(result).toEqual({ type: "Boolean" });
  });
  it("should handle null", async () => {
    const result = await getVerySimplifiedSchema(null);
    expect(result).toEqual({ type: "Null" });
  });
  it("should handle undefined", async () => {
    const result = await getVerySimplifiedSchema(undefined);
    expect(result).toEqual({ type: "Undefined" });
  });
  it("should handle object with array properties", async () => {
    const result = await getVerySimplifiedSchema({
      name: "test",
      tags: ["tag1", "tag2"],
    });
    expect(result).toEqual({
      type: "Document",
      properties: {
        name: "String",
        tags: { type: "Array", items: { type: "String" } },
      },
    });
  });
  it("should handle nested object", async () => {
    const result = await getVerySimplifiedSchema({
      name: "test",
      address: {
        street: "123 Main St",
        city: "Testville",
      },
      tags: ["tag1", "tag2"],
    });
    console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual({
      type: "Document",
      properties: {
        name: "String",
        address: {
          type: "Document",
          properties: {
            street: "String",
            city: "String",
          },
        },
        tags: { type: "Array", items: { type: "String" } },
      },
    });
  });

  it("should handle non-empty arrays of objects", async () => {
    const result = await getVerySimplifiedSchema([
      { name: "test", age: 30 },
      { name: "test2", age: 40 },
    ]);
    console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual({
      type: "Array",
      items: {
        type: "Document",
        properties: { name: "String", age: "Number" },
      },
    });
  });
});
