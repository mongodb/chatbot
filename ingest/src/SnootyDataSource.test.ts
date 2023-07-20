import nock from "nock";
import fs from "fs";
import Path from "path";
import JSONL from "jsonl-parse-stringify";
import {
  SnootyNode,
  SnootyProjectConfig,
  getSnootyProjectBaseUrl,
  makeSnootyDataSource,
} from "./SnootyDataSource";
import { sampleSnootyMetadata } from "../test/snooty_sample_metadata";
import { snootyAstToMd } from "./snootyAstToMd";
import { assert } from "console";

describe("SnootyDataSource", () => {
  describe("makeSnootyDataSource()", () => {
    const sourceConfig = {
      type: "snooty",
      name: "docs",
      currentBranch: "v6.0",
      tags: ["docs", "manual"],
    };
    const sampleDataPath = Path.resolve(
      __dirname,
      "../test/snooty_sample_data.txt"
    );
    const baseMock = nock("https://snooty-data-api.mongodb.com/prod/");
    beforeAll(() => {
      baseMock
        .get(
          `/projects/${sourceConfig.name}/${sourceConfig.currentBranch}/documents`
        )
        .reply(200, () => fs.createReadStream(sampleDataPath));
      baseMock.get("/projects").reply(200, sampleSnootyMetadata);
    });
    afterAll(() => {
      nock.cleanAll();
    });
    it("successfully loads pages", async () => {
      // TODO: fix typescript typing
      const source = await makeSnootyDataSource(
        sourceConfig as SnootyProjectConfig
      );

      const pages = await source.fetchPages();
      expect(pages.length).toBe(12);
      const astPages = JSONL.parse<{ type: string; data: { ast: SnootyNode } }>(
        fs.readFileSync(sampleDataPath, "utf8")
      );
      const baseUrl = "https://mongodb.com/docs/v6.0";
      const pageAst = astPages.find(
        (entry: { type: string }) => entry.type === "page"
      )?.data.ast;
      console.log(pageAst);
      expect(pageAst).toBeDefined();
      const firstPageText = snootyAstToMd(pageAst!, { baseUrl });
      expect(pages[0]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        tags: ["docs", "manual"],
        url: "https://mongodb.com/docs/v6.0/about",
        body: firstPageText,
      });
    });
  });
  describe("getSnootyProjectBaseUrl()", () => {
    it("gets project base url", async () => {
      const baseUrl = await getSnootyProjectBaseUrl({
        projectName: "docs",
        branchName: "v4.4",
        snootyDataApiEndpoint: "https://snooty-data-api.mongodb.com/prod",
      });
      expect(baseUrl).toBe("https://mongodb.com/docs/v4.4");
    });
    it("throws for invalid branch", async () => {
      const baseUrlPromise = getSnootyProjectBaseUrl({
        projectName: "docs",
        branchName: "not-a-branch",
        snootyDataApiEndpoint: "https://snooty-data-api.mongodb.com/prod",
      });
      await expect(baseUrlPromise).rejects.toThrow();
    });
    it("throws for invalid project", async () => {
      const baseUrlPromise = getSnootyProjectBaseUrl({
        projectName: "not-a-project",
        branchName: "v4.4",
        snootyDataApiEndpoint: "https://snooty-data-api.mongodb.com/prod",
      });
      await expect(baseUrlPromise).rejects.toThrow();
    });
  });
});
