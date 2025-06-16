import {
  makeMongoDbUniversityDataApiClient,
  TiCatalogItem,
} from "./MongoDbUniversityDataApiClient";
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
    expect(mongodbUniversityDataApiClient).toHaveProperty("getCatalogItems");
    expect(mongodbUniversityDataApiClient).toHaveProperty("getAllVideos");
  });
  describe("getCatalogItems()", () => {
    it("should load all the catalog items from the MongoDB University Data API", async () => {
      const allTiCatalogItems =
        await mongodbUniversityDataApiClient.getCatalogItems();
      expect(allTiCatalogItems.data).toBeDefined();
      expect(allTiCatalogItems.metadata).toBeDefined();
      expect(allTiCatalogItems.metadata.has_more).toBe(false);
      expect(allTiCatalogItems.data.length).toBeGreaterThan(0);
    });
    it("getCatalogItems should accept query params", async () => {
      const tiCatalogItems =
        await mongodbUniversityDataApiClient.getCatalogItems({
          publicOnly: true,
          learningFormats: ["Learning Path", "Course"],
          nestAssociatedContent: true,
        });
      expect(tiCatalogItems.data).toBeDefined();
      expect(tiCatalogItems.data[0]["status"]).toBe("published");
      expect(tiCatalogItems.data[0]["legacy"]).toBe(false);
      expect(tiCatalogItems.data[0]["in_development"]).toBe(false);
      expect(tiCatalogItems.data[0]["microsites"]).toContain("University");
      expect(["Learning Path", "Course"]).toContain(
        tiCatalogItems.data[0]["learning_format"]
      );
      const nestedContent = tiCatalogItems.data[0][
        "nested_content"
      ] as TiCatalogItem[];
      expect(nestedContent).toBeDefined();
      expect(nestedContent.length).toBeGreaterThan(0);
    });
  });
  it("should load all the videos from the MongoDB University Data API", async () => {
    const allVideos = await mongodbUniversityDataApiClient.getAllVideos();
    expect(allVideos.data).toBeDefined();
    expect(allVideos.metadata).toBeDefined();
    expect(allVideos.metadata.has_more).toBe(false);
    expect(allVideos.data.length).toEqual(allVideos.metadata.total_count);
  });
});
