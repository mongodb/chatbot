import { EmbeddedContent } from "./EmbeddedContent";
import { validateMetadata } from "./validateMetadata";
import { z } from "zod";

describe("validateMetadata", () => {
  const testContent: EmbeddedContent = {
    embedding: [],
    sourceName: "",
    text: "",
    tokenCount: 0,
    updated: new Date(),
    url: "",
    chunkAlgoHash: "",
  };

  it("infers metadata type from schema", () => {
    const content = {
      ...testContent,
      metadata: {
        foo: "bar",
        number: 1,
        someObject: {
          someProp: 123,
        },
      },
    };

    expect(() => {
      const contentTypedMetadata = validateMetadata(content, {
        foo: z.string(),
        number: z.number(),
        someObject: z.object({
          someProp: z.number(),
        }),
      });

      // See type inference
      contentTypedMetadata.metadata.foo;
    }).not.toThrow();
  });

  it("throws on metadata schema mismatch", () => {
    const content = {
      ...testContent,
      metadata: {
        something: "foo",
      },
    };
    expect(() => {
      // Should throw
      validateMetadata(content, {
        completelyUnrelatedThing: z.string(),
      });
    }).toThrow();
  });

  it("requires defined metadata", () => {
    expect(() => {
      // Should throw
      validateMetadata({ ...testContent, metadata: undefined }, {});
    }).toThrow();
  });
});
