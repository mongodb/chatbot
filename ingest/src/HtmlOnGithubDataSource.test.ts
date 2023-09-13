import { JSDOM } from "jsdom";
import {
  extractHtmlH1,
  makeHandleHtmlDocumentInRepo,
  makeHtmlOnGithubDataSource,
} from "./HtmlOnGithubDataSource";
import "dotenv/config";
import fs from "fs";
import Path from "path";
import { Page } from "chat-core";
jest.setTimeout(600000);

const sampleConf = {
  name: "sample",
  repoUrl: "https://github.com/mongodb/mongo-java-driver/",
  repoLoaderOptions: {
    branch: "gh-pages",
    ignoreFiles: [/^(?!^4.10\/driver-reactive\/).*/], // Everything BUT doc/
  },
  pathToPageUrl: (pathInRepo: string) => `https://example.com/${pathInRepo}`,
  metadata: {
    productName: "Java Reactive Streams Driver",
    version: "4.10",
  },
  extractMetadata: () => ({
    foo: "bar",
  }),
  removeElements: (domDoc: Document) => {
    return [
      ...domDoc.querySelectorAll("head"),
      ...domDoc.querySelectorAll("script"),
      ...domDoc.querySelectorAll("noscript"),
      ...domDoc.querySelectorAll(".sidebar"),
      ...domDoc.querySelectorAll(".edit-link"),
      ...domDoc.querySelectorAll(".toc"),
      ...domDoc.querySelectorAll(".nav-items"),
      ...domDoc.querySelectorAll(".bc"),
    ];
  },
  extractTitle: (domDoc: Document) => {
    const title = domDoc.querySelector("h2");
    return title?.textContent ?? undefined;
  },
};

describe.skip("HtmlOnGithubDataSource", () => {
  it("should load and process a real repo of HTML files", async () => {
    // tODO: implement
  });
});
describe("handleHtmlDocumentInRepo()", () => {
  let page: Page;
  beforeAll(async () => {
    const handleHtmlDocumentInRepo = await makeHandleHtmlDocumentInRepo(
      sampleConf
    );
    const html = fs.readFileSync(
      Path.resolve(__dirname, "./test_data/sample.html"),
      {
        encoding: "utf-8",
      }
    );
    page = await handleHtmlDocumentInRepo({
      metadata: { source: "test.html" },
      pageContent: html,
    });
  });
  it("should remove arbitrary nodes from DOM", () => {
    fs.writeFileSync("test.md", page.body);
  });
  it("should extract metadata from DOM", () => {
    // TODO: implement
  });
  it("should extract title from DOM", () => {
    // TODO: implement
  });
  it("should construct URL from path in repo", () => {
    // TODO: implement
  });
});

describe("extractHtmlH1()", () => {
  it("should extract the first H1 element", () => {
    const dom = new JSDOM(`<html><body><h1>Some Title</h1></body></html>`);
    const { document } = dom.window;
    const title = extractHtmlH1(document);
    expect(title).toBe("Some Title");
  });
});
