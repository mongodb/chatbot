import nock from "nock";
import fs from "fs";
import Path from "path";
import JSONL from "jsonl-parse-stringify";
import {
  SnootyNode,
  SnootyProjectConfig,
  handlePage,
  makeSnootyDataSource,
} from "./SnootyDataSource";
import { sampleSnootyMetadata } from "../../test_data/snooty_sample_metadata";
import { snootyAstToMd } from "./snootyAstToMd";

jest.setTimeout(15000);

describe("SnootyDataSource", () => {
  const project: SnootyProjectConfig = {
    type: "snooty",
    name: "docs",
    currentBranch: "v6.0",
    tags: ["docs", "manual"],
    baseUrl: "https://mongodb.com/docs/v6.0/",
    version: "version_name",
  };
  const snootyDataApiBaseUrl = "https://snooty-data-api.mongodb.com/prod/";
  describe("makeSnootyDataSource()", () => {
    const sampleDataPath = Path.resolve(
      __dirname,
      "./test_data/snootySampleData.jsonl"
    );
    const baseMock = nock(snootyDataApiBaseUrl);
    beforeEach(() => {
      baseMock
        .get(`/projects/${project.name}/${project.currentBranch}/documents`)
        .reply(200, () => {
          return fs.createReadStream(sampleDataPath);
        });
      baseMock.get("/projects").reply(200, sampleSnootyMetadata);
    });
    afterEach(() => {
      nock.cleanAll();
    });
    it("successfully loads pages", async () => {
      const source = await makeSnootyDataSource({
        name: `snooty-test`,
        project,
        snootyDataApiBaseUrl,
      });

      const pages = await source.fetchPages();
      expect(pages.length).toBe(12);
      const astPages = JSONL.parse<{ type: string; data: { ast: SnootyNode } }>(
        fs.readFileSync(sampleDataPath, "utf8")
      );
      const baseUrl = "https://mongodb.com/docs/v6.0";
      const pageAst = astPages.filter(
        (entry: { type: string }) => entry.type === "page"
      )[1]?.data.ast;
      expect(pageAst).toBeDefined();
      const firstPageText = snootyAstToMd(pageAst);
      expect(pages[1]).toMatchObject({
        format: "md",
        sourceName: "snooty-test",
        metadata: {
          tags: ["docs", "manual"],
        },
        url: "https://mongodb.com/docs/v6.0/administration/",
        body: firstPageText,
      });
    });
    it("removes 'index' from page_id", async () => {
      const source = await makeSnootyDataSource({
        name: "snooty-docs",
        project: project,
        snootyDataApiBaseUrl,
      });
      const pages = await source.fetchPages();
      expect(pages.length).toBe(12);
      expect(pages[0]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        metadata: {
          tags: ["docs", "manual"],
        },
        url: "https://mongodb.com/docs/v6.0/",
      });

      // This one has index at the end of a subpath, so it should not be
      // stripped because only index at the root of a project has special
      // handling in Snooty
      expect(pages[2]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        metadata: {
          tags: ["docs", "manual"],
          version: "version_name",
        },
        url: "https://mongodb.com/docs/v6.0/administration/analyzing-mongodb-performance/index/",
      });

      // This has index in the middle of the page_id that should not be stripped
      expect(pages[3]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        metadata: {
          tags: ["docs", "manual"],
          version: "version_name",
        },
        url: "https://mongodb.com/docs/v6.0/administration/index/backup-sharded-clusters/",
      });

      // This has index but part of a wider phrase so should not be stripped
      expect(pages[4]).toMatchObject({
        format: "md",
        sourceName: "snooty-docs",
        metadata: {
          tags: ["docs", "manual"],
          version: "version_name",
        },
        url: "https://mongodb.com/docs/v6.0/administration/change-streams-production-recommendations/how-to-index/",
      });
    });

    it("handles pages marked 'deleted'", async () => {
      // Use normal sample data (no deletes)
      const source = await makeSnootyDataSource({
        name: `snooty-test`,
        project,
        snootyDataApiBaseUrl,
      });
      let pages = await source.fetchPages();
      expect(
        pages.find((page) =>
          page.url.includes("administration/install-enterprise")
        )
      ).toBeDefined();

      // Hot swap the mocked backend's data source. The sample data now has one marked deleted.
      nock.cleanAll();
      baseMock
        .get(`/projects/${project.name}/${project.currentBranch}/documents`)
        .reply(200, () => {
          return fs.createReadStream(
            Path.resolve(
              __dirname,
              "./test_data/snootySampleDataWithDeleted.jsonl"
            )
          );
        });

      pages = await source.fetchPages();
      expect(
        pages.find((page) =>
          page.url.includes("administration/install-enterprise")
        )
      ).toBeUndefined();
    });
  });
});
describe("handlePage()", () => {
  it("should correctly parse openapi spec page", async () => {
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
      version: "1.0",
    });
    expect(result).toMatchObject({
      format: "openapi-yaml",
      title: "Atlas App Services Data API",
      metadata: {
        tags: ["a", "openapi"],
        version: "1.0",
      },
    });
  });
  it("should correctly parse standard page", async () => {
    const nonApiSpecPage = JSON.parse(
      fs.readFileSync(
        Path.resolve(__dirname, "./test_data/samplePage.json"),
        "utf-8"
      )
    );
    const result = await handlePage(nonApiSpecPage.data, {
      sourceName: "sample-source",
      baseUrl: "https://example.com",
      tags: ["a"],
      version: "1.0",
    });
    expect(result).toMatchObject({
      format: "md",
      title: "$merge (aggregation)",
      metadata: {
        tags: ["a"],
        version: "1.0",
      },
    });
    expect(result.body).toContain("# $merge (aggregation)");
  });
});
