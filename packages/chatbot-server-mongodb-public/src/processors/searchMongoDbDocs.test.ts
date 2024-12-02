import { searchMongoDbDocs } from "./searchMongoDbDocs";

describe("searchMongoDbDocs", () => {
  it("should return a response from the MongoDB docs search API", async () => {
    const response = await searchMongoDbDocs("MongoDB Atlas");
    console.log(response);
    expect(response).toBeDefined();
    // expect(response.status).toBe(200);
  });
});
