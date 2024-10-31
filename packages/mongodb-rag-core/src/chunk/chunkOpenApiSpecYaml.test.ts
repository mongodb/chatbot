import fs from "fs";
import Path from "path";
import GPT3Tokenizer from "gpt3-tokenizer";
import { chunkOpenApiSpecYaml } from "./chunkOpenApiSpecYaml";
import { Page } from "../contentStore";
import yaml from "yaml";

const SRC_ROOT = Path.resolve(__dirname, "..");

describe("chunkRedocOpenApiSpecYaml()", () => {
  jest.setTimeout(60000);
  it("chunks a Redoc OpenAPI spec", async () => {
    const apiSpec = JSON.parse(
      fs.readFileSync(
        Path.resolve(SRC_ROOT, "../testData/openApiSpec.json"),
        "utf-8"
      )
    );
    const page: Page = {
      sourceName: "sample-source",
      url: "https://example.com",
      title: "Sample OpenAPI Spec",
      body: yaml.stringify(apiSpec),
      format: "openapi-yaml",
    };
    const chunks = await chunkOpenApiSpecYaml(page, {
      maxChunkSize: 1250,
      chunkOverlap: 0,
      tokenizer: new GPT3Tokenizer({ type: "gpt3" }),
    });
    expect(chunks).toHaveLength(24);
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
