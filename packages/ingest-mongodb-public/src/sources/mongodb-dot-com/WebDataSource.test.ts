import * as Puppeteer from "puppeteer";
import { makePuppeteer, makeWebDataSource, scrapePage } from "./WebDataSource";
import {
  getUrlsFromSitemap,
  prepareWebSources,
  RawWebSource,
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
    await browser?.close();
  });
  test.each(testPages)("$# $name", async ({ url, name }) => {
    const { content } = await scrapePage({
      url: url,
      puppeteerPage,
    });
    fs.writeFileSync(path.join(pathOut, `${name}.md`), content?.body);
  });
  it("handles broken links that lead to a 404", async () => {
    const { content, error } = await scrapePage({
      url: "https://www.mongodb.com/not-a-real-page",
      puppeteerPage,
    });
    expect(content).toBeNull();
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
  it("processes raw web sources that have directories listed", async () => {
    const webSources = await prepareWebSources({
      rawWebSources: mockRawWebSources,
      sitemapUrls: mockSitemapUrls,
    });
    expect(webSources.length).toBe(mockRawWebSources.length);
    expect(webSources[0].name).toBe(mockRawWebSources[0].name);
    expect(webSources[0].urls.length).toBe(mockSitemapUrls.length);
    expect(webSources[1].name).toBe(mockRawWebSources[1].name);
    expect(webSources[1].urls.length).toBe(mockRawWebSources[1].urls?.length);
  });
});

const webSources: WebSource[] = [
  {
    name: "company",
    urls: [
      "https://www.mongodb.com/company",
      "https://www.mongodb.com/company/our-story",
      "https://www.mongodb.com/company/leadership-principles",
      "https://www.mongodb.com/company/values",
      "https://www.mongodb.com/company/careers",
    ],
    staticMetadata: {
      type: "Company",
    },
  },
  {
    name: "services",
    urls: [
      "https://www.mongodb.com/services/consulting",
      "https://www.mongodb.com/services/consulting/flex-consulting",
      "https://www.mongodb.com/services/training",
      "https://www.mongodb.com/services/consulting/ai-accelerator",
      "https://www.mongodb.com/services/consulting/major-version-upgrade",
    ],
    staticMetadata: {
      type: "Services",
    },
  },
];

describe("WebDataSource", () => {
  it("handles list that includes broken links", async () => {
    const source = await makeWebDataSource({
      name: "mongodb-dot-com",
      urls: [
        "https://www.mongodb.com/atlas",
        "https://www.mongodb.com/not-a-real-page",
        "https://www.mongodb.com/products",
      ],
      makePuppeteer,
    });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(2);
    expect(pages[0].url).toBe("https://www.mongodb.com/atlas");
    expect(pages[1].url).toBe("https://www.mongodb.com/products");
  });
  it("processes data source", async () => {
    const source = await makeWebDataSource({
      ...webSources[0],
      makePuppeteer,
    });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(webSources[0].urls.length);
    expect(pages[0].url).toBe(webSources[0].urls[0]);
    expect(pages[0].metadata?.type ?? {}).toBe(
      webSources[0].staticMetadata?.type
    );
  });
});

// TODO: set up test data, fake html pages
