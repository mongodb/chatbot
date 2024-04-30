import "dotenv/config";
import { makeMongoDbDotComDataSource } from "./MongoDbDotComDataSource";
import { strict as assert } from "assert";
assert(
  process.env.MONGODB_DOT_COM_CONNECTION_URI,
  "Missing MONGODB_DOT_COM_CONNECTION_URI"
);
assert(process.env.MONGODB_DOT_COM_DB_NAME, "Missing MONGODB_DOT_COM_DB_NAME");

const dotcomDataSource = makeMongoDbDotComDataSource({
  connectionUri: process.env.MONGODB_DOT_COM_CONNECTION_URI,
  dbName: process.env.MONGODB_DOT_COM_DB_NAME,
  maxPages: 10,
});
describe("MongoDbDotComDataSource", () => {
  it("should fetch pages", async () => {
    const pages = await dotcomDataSource.fetchPages();
    // writeFileSync('pages.json', JSON.stringify(pages, null, 2))
    expect(pages.length).toBeGreaterThan(0);
  });
});
