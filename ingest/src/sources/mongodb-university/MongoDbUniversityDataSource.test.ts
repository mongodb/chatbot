import "dotenv/config";
import {
  filterOnlyPublicActiveTiCatalogItems,
  makeMongoDbUniversityDataSource,
} from "./MongoDbUniversityDataSource";
jest.setTimeout(100000);

const baseUrl = "https://api.learn.mongodb.com/rest/catalog";
const apiKey = process.env.UNIVERSITY_DATA_API_KEY as string;

describe("makeMongoDBUniversityDataSource()", () => {
  it("should return a DataSource with the correct name", () => {
    const dataSource = makeMongoDbUniversityDataSource({
      sourceName: "testSource",
      baseUrl,
      apiKey,
      tiCatalogFilterFunc: () => true,
    });
    expect(dataSource.name).toBe("testSource");
  });
  it("should fetch all pages for a data source", async () => {
    const dataSource = makeMongoDbUniversityDataSource({
      sourceName: "testSource",
      baseUrl,
      apiKey,
      tiCatalogFilterFunc: () => true,
    });
    const pages = await dataSource.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
  });
  it("should fetch all pages for a data source with a filter", async () => {
    const dataSource = makeMongoDbUniversityDataSource({
      sourceName: "testSource",
      baseUrl,
      apiKey,
      tiCatalogFilterFunc: filterOnlyPublicActiveTiCatalogItems,
    });
    const pages = await dataSource.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
  });
  it("should not fetch any pages for a data source with a filter that doesn't match", async () => {
    const dataSource = makeMongoDbUniversityDataSource({
      sourceName: "testSource",
      baseUrl,
      apiKey,
      tiCatalogFilterFunc: (item) =>
        item.microsites.includes("DefinitelyNotARealMicrosite👽🧙🏓👾"),
    });
    const pages = await dataSource.fetchPages();
    expect(pages).toHaveLength(0);
  });
  it("should add metadata to each page in data source", async () => {
    const dataSource = makeMongoDbUniversityDataSource({
      sourceName: "testSource",
      baseUrl,
      apiKey,
      tiCatalogFilterFunc: filterOnlyPublicActiveTiCatalogItems,
      metadata: {
        foo: "bar",
      },
    });
    const pages = await dataSource.fetchPages();
    const samplePage1 = pages[0];
    console.log("num pgs", pages.length);
    expect(samplePage1.metadata).toHaveProperty("foo", "bar");
    const samplePage2 = pages[1];
    expect(samplePage2.metadata).toHaveProperty("foo", "bar");
  });
});
