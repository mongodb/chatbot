import "dotenv/config";
jest.setTimeout(100000);
const baseUrl = "https://api.learn.mongodb.com/rest/catalog";
const apiKey = process.env.UNIVERSITY_DATA_API_KEY as string;
describe("makeMongoDBUniversityDataSource()", () => {
  it("should return a DataSource", () => {
    // TODO
  });
  it("should fetch all pages for a data source", async () => {
    // TODO
  });
  it("should fetch all pages for a data source with a filter", async () => {
    // TODO
  });
  it("should add metadata to each page in data source", async () => {
    // TODO
  });
});
