// Import necessary modules and functions
import parseSchema from "mongodb-schema";
import {
  ChatCompletionMessageParam,
  makeTextToDriverPrompt,
  TextToDriverPromptParams,
} from "./makeTextToDriverPrompt"; // Adjust the path accordingly

// Begin the test suite
describe("makeTextToDriverPrompt", () => {
  it("should include custom instructions in the system prompt", async () => {
    const params = {
      customInstructions: "These are custom instructions.",
      mongoDb: {
        databaseName: "testDb",
        collections: [
          {
            collectionName: "testCollection",
            exampleDocuments: [{ field1: "value1" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    expect(result).toHaveLength(1);
    const systemPrompt = result[0];
    expect(systemPrompt.role).toBe("system");
    expect(systemPrompt.content).toContain(params.customInstructions);
  });

  it("should include fewShotExamples if provided", async () => {
    const fewShotExamples = [
      { role: "user", content: "Example user message" },
      { role: "assistant", content: "Example assistant message" },
    ] satisfies ChatCompletionMessageParam[];
    const params = {
      fewShotExamples,
      mongoDb: {
        databaseName: "testDb",
        collections: [
          {
            collectionName: "testCollection",
            exampleDocuments: [{ field1: "value1" }],
            indexes: [{ key: { field1: 1 }, name: "index1" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    expect(result).toHaveLength(1 + fewShotExamples.length);
    expect(result.slice(1)).toEqual(fewShotExamples);
  });

  it("should generate collection schema if generateCollectionSchemas is true", async () => {
    const params = {
      mongoDb: {
        databaseName: "testDb",
        generateCollectionSchemas: true,
        collections: [
          {
            collectionName: "testCollection",
            exampleDocuments: [{ field1: "value1" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    const systemPrompt = result[0];
    expect(systemPrompt.content).toContain("Parsed schema:");
    // parseSchema should return a schema based on the documents
    const parsedSchema = await parseSchema([{ field1: "value1" }]);
    expect(systemPrompt.content).toContain(
      JSON.stringify(parsedSchema, null, 2)
    );
  });

  it("should not generate collection schema if generateCollectionSchemas is false", async () => {
    const params = {
      mongoDb: {
        databaseName: "testDb",
        generateCollectionSchemas: false,
        collections: [
          {
            collectionName: "testCollection",
            exampleDocuments: [{ field1: "value1" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    const systemPrompt = result[0];
    expect(systemPrompt.content).not.toContain("Parsed schema:");
  });

  it("should include example documents in the system prompt", async () => {
    const params = {
      mongoDb: {
        databaseName: "testDb",
        collections: [
          {
            collectionName: "testCollection",
            exampleDocuments: [{ field1: "value1" }, { field2: "value2" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    const systemPrompt = result[0];
    expect(systemPrompt.content).toContain("Example documents:");
    expect(systemPrompt.content).toContain(
      JSON.stringify(params.mongoDb.collections[0].exampleDocuments, null, 2)
    );
  });

  it("should include indexes if provided", async () => {
    const params = {
      mongoDb: {
        databaseName: "testDb",
        collections: [
          {
            collectionName: "testCollection",
            exampleDocuments: [{ field1: "value1" }],
            indexes: [{ key: { field1: 1 }, name: "index1" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    const systemPrompt = result[0];
    expect(systemPrompt.content).toContain("Indexes:");
    expect(systemPrompt.content).toContain(
      JSON.stringify(params.mongoDb.collections[0].indexes, null, 2)
    );
  });

  it("should handle multiple collections with indexes", async () => {
    const params = {
      mongoDb: {
        databaseName: "testDb",
        generateCollectionSchemas: true,
        collections: [
          {
            collectionName: "collection1",
            exampleDocuments: [{ field1: "value1" }],
            indexes: [{ key: { field1: 1 }, name: "index1" }],
          },
          {
            collectionName: "collection2",
            exampleDocuments: [{ field2: "value2" }],
            indexes: [{ key: { field2: -1 }, name: "index2" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    const systemPrompt = result[0];
    expect(systemPrompt.content).toContain(
      `## \`"${params.mongoDb.collections[0].collectionName}"\` collection`
    );
    expect(systemPrompt.content).toContain(
      `## \`"${params.mongoDb.collections[1].collectionName}"\` collection`
    );
    expect(systemPrompt.content).toContain("Indexes:");
    expect(systemPrompt.content).toContain(
      JSON.stringify(params.mongoDb.collections[0].indexes, null, 2)
    );
    expect(systemPrompt.content).toContain(
      JSON.stringify(params.mongoDb.collections[1].indexes, null, 2)
    );
  });

  it("should handle missing customInstructions and fewShotExamples", async () => {
    const params = {
      mongoDb: {
        databaseName: "testDb",
        collections: [
          {
            collectionName: "testCollection",
            exampleDocuments: [{ field1: "value1" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    expect(result).toHaveLength(1);
    const systemPrompt = result[0];
    expect(systemPrompt.content).not.toContain("undefined");
    expect(systemPrompt.content).not.toContain("null");
  });

  it("should trim customInstructions before adding to prompt", async () => {
    const customInstructions = "  Custom instructions with spaces  ";
    const params = {
      customInstructions: customInstructions,
      mongoDb: {
        databaseName: "testDb",
        collections: [
          {
            collectionName: "testCollection",
            exampleDocuments: [{ field1: "value1" }],
          },
        ],
      },
    } satisfies TextToDriverPromptParams;

    const result = await makeTextToDriverPrompt(params);

    const systemPrompt = result[0];
    expect(
      systemPrompt.content.startsWith(customInstructions.trim() + "\n\n")
    ).toBe(true);
  });
});
