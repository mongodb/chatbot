import { makeMongoDbUniversityDataApiClient } from "./MongoDbUniversityDataApiClient";
import "dotenv/config";
jest.setTimeout(100000);
const baseUrl = "https://api.learn.mongodb.com/rest/catalog";
const apiKey = process.env.UNIVERSITY_DATA_API_KEY as string;
describe("makeMongoDbUniversityDataApiClient()", () => {
  const mongodbUniversityDataApiClient = makeMongoDbUniversityDataApiClient({
    baseUrl,
    apiKey,
  });
  it("should return a MongoDbUniversityDataApiClient", () => {
    expect(mongodbUniversityDataApiClient).toBeDefined();
    expect(mongodbUniversityDataApiClient).toHaveProperty("getAllCatalogItems");
    expect(mongodbUniversityDataApiClient).toHaveProperty("getAllVideos");
  });
  it("should load all the catalog items from the MongoDB University Data API", async () => {
    const allTiCatalogItems =
      await mongodbUniversityDataApiClient.getAllCatalogItems();
    expect(allTiCatalogItems.data).toBeDefined();
    expect(allTiCatalogItems.metadata).toBeDefined();
    expect(allTiCatalogItems.metadata.has_more).toBe(false);
    expect(allTiCatalogItems.data.length).toBeGreaterThan(0);
  });
  it("should load all the videos from the MongoDB University Data API", async () => {
    const allVideos = await mongodbUniversityDataApiClient.getAllVideos();
    expect(allVideos.data).toBeDefined();
    expect(allVideos.metadata).toBeDefined();
    expect(allVideos.metadata.has_more).toBe(false);
    expect(allVideos.data.length).toEqual(allVideos.metadata.total_count);
  });
});
