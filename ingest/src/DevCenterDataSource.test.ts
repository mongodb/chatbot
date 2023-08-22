import { strict as assert } from "assert";
import fs from "fs";
import Path from "path";
import {
  makeDevCenterPageBody,
  makeDevCenterDataSource,
  makeDevCenterPage,
} from "./DevCenterDataSource";
import "dotenv/config";

const devCenterDoc = JSON.parse(
  fs.readFileSync(
    Path.resolve(__dirname, "./test_data/sampleDevCenterPage.json"),
    {
      encoding: "utf-8",
    }
  )
);
describe("DevCenterDataSource", () => {
  jest.setTimeout(20000);
  it("loads pages from dev center", async () => {
    const { DEVCENTER_CONNECTION_URI } = process.env;
    assert(
      DEVCENTER_CONNECTION_URI !== undefined,
      "env var DEVCENTER_CONNECTION_URI not defined. Did you copy .env.example to .env and fill it in?"
    );
    const source = await makeDevCenterDataSource({
      type: "devcenter",
      name: "devcenter",
      collectionName: "search_content_prod",
      databaseName: "devcenter",
      baseUrl: "https://example.com/developer",
    });

    const pages = await source.fetchPages();

    expect(pages.length).toBeGreaterThan(300);
    pages.slice(0, 100).forEach(({ url }) => {
      expect(url).toMatch(/^https:\/\/example.com\/developer\/[A-z0-9/-]+$/);
    });
  });
});

describe("makeDevCenterPage()", () => {
  it("makes a page", () => {
    const page = makeDevCenterPage(
      devCenterDoc,
      "devcenter",
      "https://example.com/developer"
    );
    expect(page).toEqual({
      title: devCenterDoc.name,
      body: makeDevCenterPageBody({
        title: devCenterDoc.name,
        content: devCenterDoc.content,
      }),
      format: "md",
      sourceName: "devcenter",
      metadata: {
        tags: ["Realm", "GitHub Actions", "JavaScript"],
        pageDescription: devCenterDoc.description,
        contentType: devCenterDoc.type,
      },
      url: "https://example.com/developer/products/realm/build-ci-cd-pipelines-realm-apps-github-actions",
    });
  });
});
describe("makeDevCenterPageBody()", () => {
  it("removes all markdown links", () => {
    const pageBody = makeDevCenterPageBody({
      title: devCenterDoc.name,
      content: devCenterDoc.content,
    });
    expect(pageBody).not.toMatch(/\[.*\]\(.*\)/);
  });
  it("adds title to beginning of page if it exists", () => {
    const pageBody = makeDevCenterPageBody({
      title: devCenterDoc.name,
      content: devCenterDoc.content,
    });
    expect(pageBody).toMatch(/^# .*\n\n/);
  });
  it("does not add title to beginning of page if it does not exists", () => {
    const pageBody = makeDevCenterPageBody({
      title: "",
      content: devCenterDoc.content,
    });
    expect(pageBody).not.toMatch(/^# .*\n\n/);
  });
});
