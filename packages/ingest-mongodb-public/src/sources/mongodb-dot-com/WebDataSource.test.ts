import * as Puppeteer from "puppeteer";
import { makePuppeteer, makeWebDataSource, scrapePage } from "./WebDataSource";
import {
  getUrlsFromSitemap,
  makeWebDataSources,
  prepareWebSources,
  rawWebSources,
  WebSource,
} from "./webSources";
import fs from "fs";
import path from "path";
jest.setTimeout(60000);

const testPages = [
  {
    name: "company",
    url: "https://www.mongodb.com/company",
  },
  {
    name: "version",
    url: "https://www.mongodb.com/products/updates/version-release",
  },
  {
    name: "enterprise-advanced",
    url: "https://www.mongodb.com/products/self-managed/enterprise-advanced",
  },
  {
    name: "leadership",
    url: "https://www.mongodb.com/leadership",
  },
  {
    name: "customer-case-studies-landing",
    url: "https://www.mongodb.com/solutions/customer-case-studies",
  },
  {
    name: "customer-case-study-novo-nordisk",
    url: "https://www.mongodb.com/solutions/customer-case-studies/novo-nordisk",
  },
  {
    name: "no-sql-explained",
    url: "https://www.mongodb.com/resources/basics/databases/nosql-explained/",
  },
  {
    name: "database-architecture",
    url: "https://www.mongodb.com/resources/basics/databases/database-architecture/",
  },
  {
    name: "solutions-library-landing",
    url: "https://www.mongodb.com/solutions/solutions-library/",
  },
  {
    name: "solutions-library-ai-powered-call-centers",
    url: "https://www.mongodb.com/solutions/solutions-library/ai-powered-call-centers",
  },
];

describe("scrapePage", () => {
  let puppeteerPage: Puppeteer.Page;
  let browser: Puppeteer.Browser;
  const pathOut = path.join("testOutput");
  beforeAll(async () => {
    const { page: p, browser: b } = await makePuppeteer();
    puppeteerPage = p;
    browser = b;
    if (!fs.existsSync(pathOut)) {
      fs.mkdirSync(pathOut);
    }
  });
  afterAll(async () => {
    await browser.close();
  });
  test.each(testPages)("$# $name", async ({ url, name }) => {
    const { page } = await scrapePage({
      sourceName: name,
      url: url,
      puppeteerPage,
    });
    fs.writeFileSync(path.join(pathOut, `${name}.md`), page?.body);
  });
  it("handles broken links that lead to a 404", async () => {
    const { page, error } = await scrapePage({
      sourceName: "not-a-real-source",
      url: "https://www.mongodb.com/not-a-real-page",
      puppeteerPage,
    });
    expect(page).toBeNull();
    expect(error).toEqual(expect.stringContaining("404"));
  });
});

describe("getUrlsFromSitemap", () => {
  const sitemapURL = "https://www.mongodb.com/sitemap-pages.xml";
  it("should get urls from sitemap", async () => {
    const urls = await getUrlsFromSitemap(sitemapURL);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls[0]).toContain("https://www.mongodb.com");
  });
});

const company = [
  "https://www.mongodb.com/company",
  "https://www.mongodb.com/company/our-story",
  "https://www.mongodb.com/company/leadership-principles",
  "https://www.mongodb.com/company/values",
  "https://www.mongodb.com/company/careers",
];

const services = [
  "https://www.mongodb.com/services/consulting",
  "https://www.mongodb.com/services/consulting/flex-consulting",
  "https://www.mongodb.com/services/training",
  "https://www.mongodb.com/services/consulting/ai-accelerator",
  "https://www.mongodb.com/services/consulting/major-version-upgrade",
];
const webSources: WebSource[] = [
  {
    name: "company",
    urls: company,
  },
  {
    name: "services",
    urls: services,
  },
];

describe("WebDataSource", () => {
  let puppeteerPage: Puppeteer.Page;
  let puppeteerBrowser: Puppeteer.Browser;
  beforeAll(async () => {
    const { page, browser } = await makePuppeteer();
    puppeteerBrowser = browser;
    puppeteerPage = page;
  });
  afterAll(async () => {
    await puppeteerBrowser?.close();
  });
  it("handles list that includes broken links", async () => {
    const source = await makeWebDataSource({
      name: "mongodb-dot-com",
      urls: [
        "https://www.mongodb.com/atlas",
        "https://www.mongodb.com/not-a-real-page",
        "https://www.mongodb.com/products",
      ],
      puppeteerPage,
    });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(2);
    expect(pages[0].url).toBe("https://www.mongodb.com/atlas");
    expect(pages[1].url).toBe("https://www.mongodb.com/products");
  });
  it("processes data sources", async () => {
    const source = await makeWebDataSource({
      ...webSources[0],
      puppeteerPage,
    });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(webSources[0].urls.length);
    expect(pages[0].url).toBe(webSources[0].urls[0]);
    expect(pages[1].url).toBe(webSources[0].urls[1]);
  });
});
describe("prepareWebSources", () => {
  it("processes raw web sources that may be directories into uniform web sources", async () => {
    const webSources = await prepareWebSources({
      rawWebSources,
      sitemapUrl: "https://www.mongodb.com/sitemap-pages.xml",
      getUrls: () =>
        getUrlsFromSitemap("https://www.mongodb.com/sitemap-pages.xml"),
    });
    expect(webSources.length).toBe(rawWebSources.length);
  });
});
describe("makeWebDataSources", () => {
  it("processes multiple data sources", async () => {
    const sources = await makeWebDataSources(webSources);
    await sources.forEach(async (source, index) => {
      const pages = await source.fetchPages();
      expect(pages.length).toBe(webSources[index].urls.length);
      expect(pages[0].url).toBe(webSources[index].urls[0]);
    });
  });
});

// TODO: set up test data, fake html pages
