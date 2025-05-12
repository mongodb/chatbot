import {
  flattenTableOfContents,
  getSnootyTableOfContents,
  TableOfContents,
} from "./getSnootyTableOfContents";
import fs from "fs";
import Path from "path";
import nock from "nock";
import { SnootyProjectConfig } from "./SnootyDataSource";
import { PageStore, PersistedPage } from "mongodb-rag-core";

describe("getSnootyTableOfContents", () => {
  const SRC_ROOT = Path.resolve(__dirname, "../../");

  jest.setTimeout(15000);

  const project: SnootyProjectConfig = {
    type: "snooty",
    name: "docs",
    currentBranch: "v6.0",
    tags: ["docs", "manual"],
    baseUrl: "https://mongodb.com/docs/v6.0/",
  };

  const snootyDataApiBaseUrl = "https://snooty-data-api.mongodb.com/prod/";

  const sampleDataPath = Path.resolve(
    SRC_ROOT,
    "../testData/snootySampleData.jsonl"
  );

  const mockPage: PersistedPage = {
    url: "https://mongodb.com/docs/v6.0/",
    body: "",
    format: "md",
    sourceName: "",
    metadata: {
      page: {
        description: "info about this great page!",
      },
    },
    updated: new Date(),
    action: "updated",
  };

  const baseMock = nock(snootyDataApiBaseUrl);
  beforeEach(() => {
    baseMock
      .get(`/projects/${project.name}/${project.currentBranch}/documents`)
      .reply(200, () => {
        return fs.createReadStream(sampleDataPath);
      });
  });
  afterEach(() => {
    nock.cleanAll();
  });
  it("should return the table of contents", async () => {
    const toc = await getSnootyTableOfContents({
      snootyProjectName: project.name,
      currentBranch: project.currentBranch,
      baseUrl: project.baseUrl,
      pages: [mockPage],
    });
    expect(
      toc?.toctreeOrder.every((url) => url.startsWith(project.baseUrl))
    ).toBe(true);
    expect(toc?.toctreeOrder.length).toBe(1466);
    expect(toc).toMatchObject({
      title: "MongoDB Manual",
      toc: {
        title: "MongoDB Manual",
        description: mockPage.metadata?.page?.description,
        url: "https://mongodb.com/docs/v6.0/",
        // TODO: better test for this
        children: expect.arrayContaining([]),
      },
    });
    const path = Path.resolve(SRC_ROOT, "../testData/toc.json");
    console.log("writing to ", path);
    fs.writeFileSync(path, JSON.stringify(toc));
  });
});

describe("flattenTableOfContents", () => {
  const nestedPage3 = {
    title: "Other page",
    description: "info about this other page!",
    url: "https://mongodb.com/docs/v6.0/other-page",
    children: [],
  } satisfies TableOfContents;

  const nestedPage2 = {
    title: "Introduction",
    description: "info about this great page!",
    url: "https://mongodb.com/docs/v6.0/introduction",
    children: [nestedPage3],
  } satisfies TableOfContents;

  const rootPage = {
    title: "MongoDB Manual",
    url: "https://mongodb.com/docs/v6.0/",
    children: [nestedPage2],
  } satisfies TableOfContents;

  it("should flatten the table of contents", () => {
    const flattened = flattenTableOfContents(rootPage);
    expect(flattened).toHaveLength(3);
    expect(flattened[0]).toMatchObject(rootPage);
    expect(flattened[1]).toMatchObject(nestedPage2);
    expect(flattened[2]).toMatchObject(nestedPage3);
  });
  it("should return the table of contents for a specific entry", () => {
    const entry = flattenTableOfContents(rootPage, nestedPage2.url);
    expect(entry).toHaveLength(2);
    expect(entry[0]).toMatchObject(nestedPage2);
    expect(entry[1]).toMatchObject(nestedPage3);
  });
});
