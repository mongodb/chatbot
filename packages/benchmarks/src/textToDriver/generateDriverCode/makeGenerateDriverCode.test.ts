import { MongoMemoryServer } from "mongodb-memory-server";
import {
  MongoClient,
  Db,
  Collection,
  Document,
} from "mongodb-rag-core/mongodb";
import {
  makeGenerateDriverCode,
  MakeGenerateDriverCodeParams,
} from "./makeGenerateDriverCode";
import { OpenAI } from "mongodb-rag-core/openai";

// Mock external dependencies
jest.mock("mongodb-rag-core/openai");
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe("makeGenerateDriverCode", () => {
  jest.setTimeout(60000);
  let mongoServer: MongoMemoryServer;
  let mongoClient: MongoClient;
  let db: Db;
  let collection: Collection<Document>;
  const databaseName = "testdb";
  const collectionName = "testCollection";

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    db = mongoClient.db(databaseName);
    collection = db.collection(collectionName);

    // Insert sample data
    await collection.insertMany([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ]);
  });

  afterAll(async () => {
    // Clean up
    await mongoClient.close();
    await mongoServer.stop();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("makeGenerateDriverCode constructs generateDriverCode function", async () => {
    // Define parameters for makeGenerateDriverCode
    const params: MakeGenerateDriverCodeParams = {
      promptGenerationConfig: {
        customInstructions: "Custom instructions",
        mongoDb: {
          databaseName,
          collections: [
            {
              collectionName,
              indexes: [{ key: { name: 1 } }],
            },
          ],
        },
      },
      sampleGenerationConfig: {
        mongoClient,
        limit: 1,
      },
    };

    // Call makeGenerateDriverCode
    const generateDriverCode = await makeGenerateDriverCode(params);

    // Assertions
    expect(generateDriverCode).toBeInstanceOf(Function);
  });

  test("generateDriverCode generates code using OpenAI API", async () => {
    // Mock OpenAI API
    const mockCreateCompletion = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: "Generated driver code",
          },
        },
      ],
    });
    MockedOpenAI.mockImplementation(
      () =>
        ({
          chat: {
            completions: {
              create: mockCreateCompletion,
            },
          },
        } as any)
    );

    // Define parameters
    const params: MakeGenerateDriverCodeParams = {
      promptGenerationConfig: {
        customInstructions: "Custom instructions",
        mongoDb: {
          databaseName,
          collections: [
            {
              collectionName,
              indexes: [{ key: { name: 1 } }],
            },
          ],
        },
      },
      sampleGenerationConfig: {
        mongoClient,
        limit: 1,
      },
    };

    // Call makeGenerateDriverCode
    const generateDriverCode = await makeGenerateDriverCode(params);

    // Create an instance of the mocked OpenAI client
    const openAiClient = new OpenAI({ apiKey: "test-key" });

    // Call the generated generateDriverCode function
    const generatedCode = await generateDriverCode({
      openAiClient,
      userPrompt: "Find all users over 20 years old.",
      llmOptions: {
        model: "gpt-4",
      },
    });

    // Assertions
    expect(generatedCode).toBe("Generated driver code");
    expect(mockCreateCompletion).toHaveBeenCalledTimes(1);
  });
});
