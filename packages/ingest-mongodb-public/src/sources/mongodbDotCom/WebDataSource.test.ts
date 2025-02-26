import { makeWebDataSource, scrapePage } from "./WebDataSource";
import {
  getUrlsFromSitemap,
  prepareWebSources,
  InitialWebSource,
} from "./webSources";
import fs from "fs";
import path from "path";
import { Page as PlaywrightPage, Browser } from "playwright";

jest.setTimeout(60000);

const SRC_ROOT = path.resolve(__dirname, "../../");

describe("getUrlsFromSitemap", () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it("should return an array of URLs from the sitemap", async () => {
    const sitemapPath = path.resolve(SRC_ROOT, "../testData/sitemap-pages.xml");
    const sitemapXML = fs.readFileSync(sitemapPath, "utf8");
    (global.fetch as jest.Mock).mockResolvedValue({
      text: jest.fn().mockResolvedValue(sitemapXML),
    });
    const urls = await getUrlsFromSitemap("http://example.com/sitemap.xml");
    expect(urls).toStrictEqual([
      "https://www.mongodb.com/blog/post/supercharge-ai-data-management-knowledge-graphs",
      "https://www.mongodb.com/blog/post/reintroducing-versioned-mongodb-atlas-administration-api",
      "https://www.mongodb.com/blog/post/building-gen-ai-mongodb-ai-partners-january-2025",
      "https://www.mongodb.com/blog/post/mongodb-empowers-isvs-to-drive-saas-innovation-india",
      "https://www.mongodb.com/blog/post/simplify-security-at-scale-resource-policies-mongodb-atlas",
    ]);
  });
});

describe("prepareWebSources", () => {
  const mockInitialWebSources: InitialWebSource[] = [
    {
      name: "directory-web-source",
      urls: [],
      directoryUrls: [
        "https://www.mongodb.com/directory-web-source",
        "https://www.mongodb.com/another-directory-web-source",
      ],
      staticMetadata: {
        type: "Directory Web Source",
      },
    },
    {
      name: "url-web-source",
      urls: [
        "https://www.mongodb.com/url-web-source/one",
        "https://www.mongodb.com/url-web-source/two",
        "https://www.mongodb.com/url-web-source/three",
      ],
      staticMetadata: {
        type: "Url web source",
      },
    },
  ];
  const mockSitemapUrls = [
    "https://www.mongodb.com/directory-web-source/one",
    "https://www.mongodb.com/directory-web-source/two",
    "https://www.mongodb.com/another-directory-web-source/one",
    "https://www.mongodb.com/another-directory-web-source/two",
  ];
  it("processes raw web sources that have directories listed to create a url list", async () => {
    const webSources = await prepareWebSources({
      initialWebSources: mockInitialWebSources,
      sitemapUrls: mockSitemapUrls,
    });
    expect(webSources.length).toBe(2);
    const [directoryWebSource, urlWebSource] = webSources;
    expect(directoryWebSource.urls.length).toBe(4);
    expect(directoryWebSource.urls).toStrictEqual(mockSitemapUrls);
    expect(urlWebSource.urls).toStrictEqual(mockInitialWebSources[1].urls);
  });
});

describe("scrapePage", () => {
  const mockBrowserPage = {
    goto: jest.fn(),
    evaluate: jest.fn(),
  } as unknown as PlaywrightPage & { evaluate: jest.Mock };
  it("returns content and no error for a valid URL", async () => {
    (mockBrowserPage.goto as jest.Mock).mockImplementation(() =>
      Promise.resolve({ status: () => 200 })
    );
    mockBrowserPage.evaluate.mockResolvedValue({
      bodyInnerHtml: "<html><body><h1>Test Page</h1></body></html>",
      headInnerHtml: "<html><head><title>Test Page</title></head></html>",
    });
    const { content, error } = await scrapePage({
      browserPage: mockBrowserPage,
      url: "https://www.mongodb.com/valid-page",
    });
    expect(error).toBeNull();
    expect(content).toMatchObject({
      body: "# Test Page",
      metadata: {},
      title: "Test Page",
    });
  });
  it("returns an error for an invalid URL", async () => {
    (mockBrowserPage.goto as jest.Mock).mockImplementation(() =>
      Promise.resolve({ status: () => 404 })
    );
    const { content, error } = await scrapePage({
      browserPage: mockBrowserPage,
      url: "https://www.mongodb.com/not-a-real-page",
    });
    expect(content).toBeNull();
    expect(error).toBe(
      "failed to open the page: https://www.mongodb.com/not-a-real-page with: Error: 404"
    );
  });
  it("returns an error when an exception is thrown", async () => {
    (mockBrowserPage.goto as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error("Network error"))
    );
    const { content, error } = await scrapePage({
      browserPage: mockBrowserPage,
      url: "https://www.mongodb.com/exception-page",
    });
    expect(content).toBeNull();
    expect(error).toBe(
      "failed to open the page: https://www.mongodb.com/exception-page with: Error: Network error"
    );
  });
});

describe("WebDataSource", () => {
  const mockBrowser = {
    page: {
      goto: jest.fn().mockImplementation((url) => {
        if (url.includes("not-a-real-page")) {
          return { status: () => 404 };
        }
        return { status: () => 200 };
      }),
      evaluate: jest.fn().mockImplementation(() => {
        const html = fs.readFileSync(
          path.resolve(SRC_ROOT, "../testData/mongodbdotcom-company-page.html"),
          "utf-8"
        );
        return {
          bodyInnerHtml: html,
          headInnerHtml: html,
        };
      }),
    } as unknown as PlaywrightPage,
    browser: {
      close: jest.fn(),
    } as unknown as Browser,
  };

  it("handles empty urls list", async () => {
    const source = await makeWebDataSource({
      name: "empty-source",
      urls: [],
      makeBrowser: async () => mockBrowser,
    });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(0);
  });
  it("handles invalid urls", async () => {
    const source = await makeWebDataSource({
      name: "mongodb-dot-com",
      urls: ["https://www.mongodb.com/not-a-real-page"],
      makeBrowser: async () => mockBrowser,
    });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(0);
  });
  it("handles valid urls", async () => {
    const source = await makeWebDataSource({
      name: "valid-source",
      urls: ["https://www.mongodb.com/company"],
      makeBrowser: async () => mockBrowser,
    });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(1);
    expect(pages[0]).toMatchObject({
      url: "https://www.mongodb.com/company",
      metadata: {
        description:
          "MongoDB empowers innovators with our developer data platform and integrated services. MongoDB enables development teams to meet the diverse needs of modern apps. ",
        contentType: "website",
        siteTitle: "MongoDB",
      },
      title: "About MongoDB",
      sourceName: "valid-source",
      format: "md",
    });
  });
});
