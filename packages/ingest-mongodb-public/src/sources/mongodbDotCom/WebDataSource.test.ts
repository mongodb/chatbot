import puppeteer, * as Puppeteer from "puppeteer";
import { makeWebDataSource } from "./WebDataSource";
import {
  getUrlsFromSitemap,
  prepareWebSources,
  RawWebSource,
} from "./webSources";
import fs from "fs";
import path from "path";
import { chromium } from 'playwright';
jest.setTimeout(60000);

global.fetch = jest.fn();

const SRC_ROOT = path.resolve(__dirname, "../../");

describe("getUrlsFromSitemap", () => {
  it("should return an array of URLs from the sitemap", async () => {
    const sitemapPath = path.resolve(SRC_ROOT, "../testData/sitemap-pages.xml");
    const sitemapXML = fs.readFileSync(sitemapPath, "utf8");
    (global.fetch as jest.Mock).mockResolvedValue({
      text: jest.fn().mockResolvedValue(sitemapXML),
    });
    const urls = await getUrlsFromSitemap("http://example.com/sitemap.xml");
    expect(urls).toBeInstanceOf(Array);
    expect(urls.length).toBeGreaterThan(0);
    expect(typeof urls[0]).toBe("string");
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
  const mockRawWebSources: RawWebSource[] = [
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
      rawWebSources: mockRawWebSources,
      sitemapUrls: mockSitemapUrls,
    });
    expect(webSources.length).toBe(2);
    const [directoryWebSource, urlWebSource] = webSources;
    expect(directoryWebSource.urls.length).toBe(4);
    expect(directoryWebSource.urls).toStrictEqual(mockSitemapUrls);
    expect(urlWebSource.urls).toStrictEqual(mockRawWebSources[1].urls);
  });
});

test.only('Playwright scraper extracts correct data', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = 'https://mongodb.com/company'; 
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const data = await page.evaluate(() => {
      return {
          title: document.title,
          heading: document.querySelector('h1')?.textContent || 'No heading found',
      };
  });
  expect(data.title).toBeTruthy();
  expect(data.title).toBe('About MongoDB | MongoDB');
  await browser.close();
});
