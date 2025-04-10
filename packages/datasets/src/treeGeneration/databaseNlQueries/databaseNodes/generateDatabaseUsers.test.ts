import { ObjectId } from "mongodb-rag-core/mongodb";
import { generateDatabaseUsers } from "./generateDatabaseUsers";
import { DatabaseInfoNode, DatabaseInfoSchema } from "./nodeTypes";
import { sampleMovieDbInfo, makeSampleLlmOptions } from "./sampleData";

// Skipping LLM call tests
describe.skip("generateDatabaseUsers", () => {
  jest.setTimeout(3000 * 1000); // Increase timeout for OpenAI API calls

  it("should generate users for a movie database", async () => {
    // Validate the schema
    const validatedInfo = DatabaseInfoSchema.parse(sampleMovieDbInfo);

    // Create a parent node with the database info
    const parentNode: DatabaseInfoNode = {
      _id: new ObjectId(),
      parent: null,
      data: validatedInfo,
      updated: new Date(),
    };

    // Generate users for the movie database
    const users = await generateDatabaseUsers(
      parentNode,
      makeSampleLlmOptions(),
      20
    );

    console.log(users.map((user) => user.data));
  });
});
