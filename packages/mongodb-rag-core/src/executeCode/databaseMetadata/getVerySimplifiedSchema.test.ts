import { getVerySimplifiedSchema } from "./getVerySimplifiedSchema";

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
