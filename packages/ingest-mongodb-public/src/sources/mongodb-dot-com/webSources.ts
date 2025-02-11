import puppeteer, { Browser } from "puppeteer";
import xml2js from "xml2js";
import { makeWebDataSource } from "./WebDataSource";

export const sitemapURL = "https://www.mongodb.com/sitemap-pages.xml";

type RawWebSource = {
  name: string;
  urls?: string[];
  directoryUrl?: string;
  staticMetadata?: Record<string, string>;
};

export const rawWebSources: RawWebSource[] = [
  {
    name: "customer-case-studies",
    directoryUrl: "https://www.mongodb.com/solutions/customer-case-studies",
    staticMetadata: {
      type: "Customer Case Study",
    },
  },
  {
    name: "solutions-library",
    directoryUrl: "https://www.mongodb.com/solutions/solutions-library",
    staticMetadata: {
      type: "Solutions Library",
    },
  },
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
  // TODO: add more web sources here
];

export async function getUrlsFromSitemap(
  sitemapURL: string
): Promise<string[]> {
  const response = await fetch(sitemapURL);
  const sitemap = await response.text();
  const parser = new xml2js.Parser();
  const parsedXML = await parser.parseStringPromise(sitemap);
  return parsedXML.urlset.url.map((url: { loc: string[] }) => url.loc[0]);
}

export type WebSource = {
  name: string;
  urls: string[];
  staticMetadata?: Record<string, string>;
};

type PrepareWebSourcesParams = {
  rawWebSources: RawWebSource[];
  sitemapUrl: string;
  getUrls: (sitemapURL: string) => Promise<string[]>;
};

/*
  Prepare web sources by:
    1. prefixing "web-" to source names
    2. if the source is a directory and not a list of urls, 
    use the sitemap to get the urls for the entire directory
*/
export const prepareWebSources = async ({
  rawWebSources,
  sitemapUrl,
  getUrls,
}: PrepareWebSourcesParams): Promise<WebSource[]> => {
  let urlsFromSitemap: string[] = [];
  const webSources: WebSource[] = [];
  for (const rawWebSource of rawWebSources) {
    if (rawWebSource.urls && rawWebSource.directoryUrl) {
      throw new Error("Cannot have both urls and directoryUrl");
    } else if (rawWebSource.urls) {
      webSources.push(rawWebSource as WebSource);
    } else if (rawWebSource.directoryUrl) {
      if (urlsFromSitemap.length === 0) {
        urlsFromSitemap = await getUrls(sitemapUrl);
      }
      webSources.push({
        ...rawWebSource,
        urls: urlsFromSitemap.filter((url) => url.includes(rawWebSource.name)),
      });
    }
  }
  return webSources;
};

export const makePuppeteer = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: "new",
    executablePath: "/opt/homebrew/bin/chromium", // TODO
  });
  const page = await browser.newPage();
  return { page, browser };
};

// Create a data source for each web source
export const makeWebDataSources = async (webSources: WebSource[]) => {
  let puppeteerBrowser: Browser | undefined;
  try {
    const { page: puppeteerPage, browser } = await makePuppeteer();
    puppeteerBrowser = browser;
    return webSources.map((webSource) => {
      return makeWebDataSource({
        ...webSource,
        puppeteerPage,
      });
    });
  } finally {
    puppeteerBrowser?.close();
  }
  // TODO: check if page can be closed
};
