import puppeteer from "puppeteer";
import xml2js from "xml2js";

export const sitemapURL = "https://www.mongodb.com/sitemap-pages.xml";

export type RawWebSource = {
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
  sitemapUrls: string[];
};

/*
 */
export const prepareWebSources = async ({
  rawWebSources,
  sitemapUrls,
}: PrepareWebSourcesParams): Promise<WebSource[]> => {
  const webSources: WebSource[] = [];
  for (const rawWebSource of rawWebSources) {
    if (rawWebSource.urls && rawWebSource.directoryUrl) {
      throw new Error("Cannot have both urls and directoryUrl");
    } else if (rawWebSource.urls) {
      webSources.push(rawWebSource as WebSource);
    } else if (rawWebSource.directoryUrl) {
      webSources.push({
        ...rawWebSource,
        urls: sitemapUrls.filter((url) => url.includes(rawWebSource.name)),
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
