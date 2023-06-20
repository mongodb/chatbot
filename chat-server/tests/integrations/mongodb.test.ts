import "dotenv/config";
import { MongoDB } from "../../src/integrations/mongodb";

describe("MongoDB", () => {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    VECTOR_SEARCH_INDEX_NAME,
  } = process.env;
  const mongodb = new MongoDB(
    MONGODB_CONNECTION_URI!,
    MONGODB_DATABASE_NAME!,
    VECTOR_SEARCH_INDEX_NAME!
  );
  afterEach(async () => {
    await mongodb.close();
  });
  test("Should connect to the database", async () => {
    // ping database
    const ping = await mongodb.db.command({ ping: 1 });
    expect(ping).toHaveProperty("ok", 1);
  });
});
