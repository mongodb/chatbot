import * as Puppeteer from "puppeteer";
import {
  getUrlsFromSitemap,
  makePuppeteer,
  makeWebDataSource,
  scrapePage,
} from "./WebDataSource";
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
    const page = await scrapePage({
      url: url,
      puppeteerPage,
    });
    fs.writeFileSync(path.join(pathOut, `${name}.md`), page.body);
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

describe("WebDataSource", () => {
  it("loads pages from sitemap", async () => {
    const getUrlsFromSitemapMock = jest.fn().mockResolvedValue([
      "https://www.mongodb.com/solutions/customer-case-studies/toyota-connected",
      "https://www.mongodb.com/solutions/customer-case-studies/wells-fargo",
    ]);
    const source = await makeWebDataSource({ 
      name: "mongodb-dot-com",
      individualUrls: [
        "https://www.mongodb.com/atlas",
        "https://www.mongodb.com/products",
      ],
      sitemap: {
        sitemapUrl: "https://www.mongodb.com/sitemap-pages.xml",
        directories: [
          "https://www.mongodb.com/solutions/customer-case-studies",
        ],
        getUrlsFromSitemap: getUrlsFromSitemapMock,
        directoryFilter: (sitemapUrls, directories) => {
          return sitemapUrls.filter((url) =>
            directories.some((directoryUrl) => url.startsWith(directoryUrl))
          );
        }
      }
     });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(4);
    expect(pages[0].url).toBe("https://www.mongodb.com/solutions/customer-case-studies/toyota-connected");
    expect(pages[1].url).toBe("https://www.mongodb.com/solutions/customer-case-studies/wells-fargo");
    expect(pages[2].url).toBe("https://www.mongodb.com/atlas");
    expect(pages[3].url).toBe("https://www.mongodb.com/products");
  });
});
