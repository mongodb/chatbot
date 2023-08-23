import fs from "fs";
import Path from "path";
import GPT3Tokenizer from "gpt3-tokenizer";
import { handlePage } from "./SnootyDataSource";
import { chunkOpenApiSpecYaml } from "./chunkOpenApiSpecYaml";

describe("chunkRedocOpenApiSpecYaml()", () => {
  it("chunks a Redoc OpenAPI spec", async () => {
    const apiSpecPage = JSON.parse(
      fs.readFileSync(
        Path.resolve(__dirname, "./test_data/localOpenApiSpecPage.json"),
        "utf-8"
      )
    );
    const result = await handlePage(apiSpecPage.data, {
      sourceName: "sample-source",
      baseUrl: "https://example.com",
      tags: ["a"],
    });
    const chunks = await chunkOpenApiSpecYaml(result, {
      chunkSize: 1250,
      chunkOverlap: 0,
      tokenizer: new GPT3Tokenizer({ type: "gpt3" }),
    });
    expect(chunks).toHaveLength(40);
    const chunkTextExpected1 = `---
resourceName: POST /action/findOne
openApiSpec: true
apiName: MongoDB Atlas Data API
baseUrls:
  - https://data.mongodb-api.com/app/{appId}/endpoint/data/v1
  - https://{region}.data.mongodb-api.com/app/{appId}/endpoint/data/v1`;
    expect(chunks[0].text).toContain(chunkTextExpected1);
    const chunkTextExpected2 = `/action/findOne:
  post:
    operationId: findOne
    summary: Find One Document
    description: Find a single document that matches a query.
    x-codeSamples:`;
    expect(chunks[0].text).toContain(chunkTextExpected2);
  });
});
