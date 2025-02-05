import { Page } from "mongodb-rag-core";
import { DataSource } from "mongodb-rag-core/dataSources";
import * as cheerio from "cheerio";
import puppeteer, { Page as PuppeteerPage } from "puppeteer";
import TurndownService from "turndown";
import * as turndownPluginGfm from "turndown-plugin-gfm";
import xml2js from "xml2js";

// TODO: move to constants file
const sitemapURL = "https://www.mongodb.com/sitemap-pages.xml";
// urls of the directories where we want every single page
const directoryUrls = [
  "https://www.mongodb.com/solutions/customer-case-studies",
  "https://www.mongodb.com/solutions/solutions-library/",
];
const individualUrls = [
  "https://www.mongodb.com/atlas",
  "https://www.mongodb.com/",
  "https://www.mongodb.com/products",
  "https://www.mongodb.com/products/self-managed/enterprise-advanced",
  "https://www.mongodb.com/try/download/community",
  "https://www.mongodb.com/products/tools/atlas-cli",
  "https://www.mongodb.com/products/tools",
  "https://www.mongodb.com/products/updates/version-release",
  "https://www.mongodb.com/products/platform/atlas-database",
  "https://www.mongodb.com/products/platform/atlas-search",
  "https://www.mongodb.com/products/platform/atlas-vector-search",
  "https://www.mongodb.com/products/platform/atlas-stream-processing",
  "https://www.mongodb.com/products/platform/atlas-vector-search/features",
  "https://www.mongodb.com/products/platform/atlas-vector-search/getting-started",
  "https://www.mongodb.com/products/tools/compass",
  "https://www.mongodb.com/solutions/use-cases/artificial-intelligence",
  "https://www.mongodb.com/solutions/use-cases/payments",
  "https://www.mongodb.com/solutions/use-cases/serverless",
  "https://www.mongodb.com/solutions/use-cases/gaming",
  "https://www.mongodb.com/solutions/industries/financial-services",
  "https://www.mongodb.com/solutions/industries/telecommunications",
  "https://www.mongodb.com/solutions/industries/healthcare",
  "https://www.mongodb.com/solutions/industries/retail",
  "https://www.mongodb.com/solutions/industries/public-sector",
  "https://www.mongodb.com/solutions/industries/manufacturing",
  "https://www.mongodb.com/solutions/industries/insurance",
  "https://www.mongodb.com/solutions/developer-data-platform",
  "https://www.mongodb.com/solutions/startups",
  "https://www.mongodb.com/solutions/customer-case-studies",
  "https://www.mongodb.com/services/consulting/ai-applications-program",
  "https://www.mongodb.com/company",
  "https://www.mongodb.com/company/our-story",
  "https://www.mongodb.com/company/leadership-principles",
  "https://www.mongodb.com/company/values",
  "https://www.mongodb.com/company/careers",
  "https://www.mongodb.com/services/consulting",
  "https://www.mongodb.com/services/consulting/flex-consulting",
  "https://www.mongodb.com/services/training",
  "https://www.mongodb.com/services/consulting/ai-accelerator",
  "https://www.mongodb.com/services/consulting/major-version-upgrade",
  "https://www.mongodb.com/pricing",
  "https://www.mongodb.com/products/platform/trust",
  "https://www.mongodb.com/products/capabilities/security",
  "https://www.mongodb.com/products/capabilities/security/encryption",
  "https://www.mongodb.com/products/platform/atlas-for-government",
  "https://www.mongodb.com/products/platform/atlas-cloud-providers/aws",
  "https://www.mongodb.com/products/platform/atlas-cloud-providers/azure",
  "https://www.mongodb.com/products/platform/atlas-cloud-providers/google-cloud",
  "https://www.mongodb.com/products/integrations/kubernetes/atlas-kubernetes-operator",
  "https://www.mongodb.com/products/platform/atlas-online-archive",
  "https://www.mongodb.com/products/integrations/hashicorp-terraform",
  "https://www.mongodb.com/products/platform/atlas-charts",
  "https://www.mongodb.com/products/platform/cloud",
  "https://www.mongodb.com/solutions/solutions-library/",
  "https://www.mongodb.com/resources/basics/databases/nosql-explained/",
  "https://www.mongodb.com/resources/basics/databases/acid-transactions/",
  "https://www.mongodb.com/resources/basics/databases/nosql-explained/nosql-vs-sql/",
  "https://www.mongodb.com/resources/basics/json-and-bson/",
  "https://www.mongodb.com/resources/basics/databases/cloud-databases/free-cloud-database/",
  "https://www.mongodb.com/resources/basics/full-stack-development/",
  "https://www.mongodb.com/resources/basics/databases/what-is-an-object-oriented-database/",
  "https://www.mongodb.com/resources/basics/cloud-explained/iot-architecture/",
  "https://www.mongodb.com/resources/basics/databases/key-value-database/",
  "https://www.mongodb.com/resources/basics/databases/in-memory-database/",
  "https://www.mongodb.com/resources/basics/data-engineering/",
  "https://www.mongodb.com/resources/basics/fuzzy-match/",
  "https://www.mongodb.com/resources/basics/vector-stores/",
  "https://www.mongodb.com/resources/basics/artificial-intelligence/ai-stack/",
  "https://www.mongodb.com/resources/basics/databases/database-hosting/",
  "https://www.mongodb.com/resources/basics/hierarchical-navigable-small-world",
  "https://www.mongodb.com/resources/basics/artificial-intelligence/generative-ai-use-cases",
  "https://www.mongodb.com/resources/basics/artificial-intelligence/ai-agents",
  "https://www.mongodb.com/resources/basics/vector-index",
  "https://www.mongodb.com/resources/basics/prompt-engineering",
  "https://www.mongodb.com/resources/basics/predictive-ai",
  "https://www.mongodb.com/resources/basics/reinforcement-learning",
  "https://www.mongodb.com/resources/basics/artificial-intelligence/machine-learning-healthcare",
  "https://www.mongodb.com/resources/basics/named-entity-recognition",
  "https://www.mongodb.com/resources/basics/langchain",
  "https://www.mongodb.com/resources/basics/quantum-machine-learning",
  "https://www.mongodb.com/resources/basics/ann-search",
  "https://www.mongodb.com/resources/basics/vector-embeddings",
  "https://www.mongodb.com/resources/basics/self-supervised-learning",
  "https://www.mongodb.com/resources/basics/vector-search",
  "https://www.mongodb.com/resources/basics/unified-modeling-language",
  "https://www.mongodb.com/resources/basics/ai-hallucinations",
  "https://www.mongodb.com/resources/basics/ai-in-finance",
  "https://www.mongodb.com/resources/basics/what-is-stream-processing",
  "https://www.mongodb.com/resources/basics/cognitive-search",
  "https://www.mongodb.com/resources/basics/foundation-models",
  "https://www.mongodb.com/resources/basics/ai-stack",
  "https://www.mongodb.com/resources/products/compatibilities/kubernetes",
  "https://www.mongodb.com/resources/products/capabilities/stored-procedures",
  "https://www.mongodb.com/resources/basics/cloud-explained/iaas-infrastructure-as-a-service",
  "https://www.mongodb.com/resources/basics/databases/cloud-databases/cloud-migration",
  "https://www.mongodb.com/resources/basics/unstructured-data/tools",
  "https://www.mongodb.com/resources/basics/system-of-insight",
  "https://www.mongodb.com/resources/basics/databases/middleware",
  "https://www.mongodb.com/resources/basics/disaster-recovery",
  "https://www.mongodb.com/resources/basics/cloud-explained/business-intelligence-bi-tools",
  "https://www.mongodb.com/resources/basics/observability",
  "https://www.mongodb.com/resources/basics/role-based-access-control",
  "https://www.mongodb.com/resources/basics/real-time-payments",
  "https://www.mongodb.com/resources/basics/databases/cloud-databases/free-cloud-database",
];

export function makeWebDataSource({
  maxPages,
}: {
  maxPages?: number; // for testing
}): DataSource {
  return {
    name: "mongodb-web",
    async fetchPages() {
      let browser;
      try {
        const { page: puppeteerPage, browser: b } = await makePuppeteer();
        browser = b;
        // Use the sitemap to get the urls belonging to the directories we want every page from
        const completeDirectoryUrls = await getCompleteDirectoriesFromSitemap(
          sitemapURL
        );
        // Get urls from the list provided by web team
        const urls = [...completeDirectoryUrls, ...individualUrls];
        const pages: Page[] = [];
        for await (const [index, url] of urls.entries()) {
          if (maxPages && index >= maxPages) {
            break;
          }
          pages.push(
            await scrapePage({
              url,
              puppeteerPage,
            })
          );
        }
        return pages;
      } finally {
        await browser?.close();
      }
    },
  };
}

export async function getUrlsFromSitemap(
  sitemapURL: string
): Promise<string[]> {
  const response = await fetch(sitemapURL);
  const sitemap = await response.text();
  const parser = new xml2js.Parser();
  const parsedXML = await parser.parseStringPromise(sitemap);
  return parsedXML.urlset.url.map((url: { loc: string[] }) => url.loc[0]);
}

export async function getCompleteDirectoriesFromSitemap(
  sitemapURL: string
): Promise<string[]> {
  const sitemapUrls = await getUrlsFromSitemap(sitemapURL);
  return sitemapUrls.filter((url) =>
    directoryUrls.some((directoryUrl) => url.startsWith(directoryUrl))
  );
}

function makeTurndownService({
  baseUrl,
  includeImages,
  includeLinks,
}: {
  baseUrl: string;
  includeImages?: boolean;
  includeLinks?: boolean;
}) {
  // Turndown with correct options
  const turndownService = new TurndownService({
    codeBlockStyle: "fenced",
    headingStyle: "atx",
    bulletListMarker: "-",
  });
  turndownService.use(turndownPluginGfm.gfm);

  // Trim whitespace in Markdown links
  turndownService.addRule("trimLinkText", {
    filter: ["a"], // Matches anchor tags
    replacement: (content, node) => {
      const element = node as Element;
      const trimmedContent = content.trim();
      if (!includeLinks) {
        return trimmedContent;
      }
      let href = element.getAttribute("href");
      if (!href) {
        return content.trim(); // No href, return trimmed content
      }
      if (href.startsWith("/")) {
        href = `${baseUrl.replace(/\/$/, "")}${href}`;
      }

      // Trim whitespace at the beginning and end of the content and construct the Markdown link
      return `[${trimmedContent}](${href.trim()})`;
    },
  });

  // Remove images from Markdown
  if (!includeImages) {
    turndownService.addRule("removeImages", {
      filter: ["img"],
      replacement: () => {
        return ""; // Return an empty string to remove the image
      },
    });
  }
  return turndownService;
}

const mongoDbDotcomTurndownService = makeTurndownService({
  baseUrl: "https://mongodb.com",
});

/**
  Get relevant metadata from the page
 */
function getMetaTags($: cheerio.CheerioAPI): Record<string, string> {
  const metaTags: Record<string, string> = {};

  const meta = $("meta");
  meta.each((_, element) => {
    const $element = $(element);
    const key = $element.attr("name") || $element.attr("property");
    const content = $element.attr("content");

    // Handles open graph tags
    if (key?.startsWith("og:") && content) {
      if (key === "og:site_name") {
        metaTags.siteTitle = content;
      } else if (key === "og:type") {
        metaTags.contentType = content;
      } else if (key === "og:description") {
        metaTags.description = content;
      }
    }
  });

  return metaTags;
}

function removeHtmlElements($: cheerio.CheerioAPI) {
  $("script").remove(); // remove all scripts
  $("style").remove();
  $("header").remove(); // Remove header
  $("#onetrust-consent-sdk").remove(); // Remove privacy + consent stuff
  $(".resource-grid").remove(); // remove resource grids which aren't rendered well to Markdown
  $(".z-\\[9999\\]").remove(); // Remove banner
  $(".pencil-banner-no-underline").remove(); // Remove banner
  $(".CodeMirror-linenumber").remove(); // Remove number line from code blocks
  $("footer").remove(); // Remove footer
  $("nav").remove(); // Remove nav
  return $.html();
}

function getTitle(
  $body: cheerio.CheerioAPI,
  $head: cheerio.CheerioAPI
): string | undefined {
  const bodyTitle = $body("h1").first().text();
  if (bodyTitle.length > 0) {
    return bodyTitle;
  }
  const headTitle = $head("title").first().text();
  if (headTitle.length > 0) {
    return headTitle;
  }
}

async function getContent(
  page: PuppeteerPage
): Promise<Pick<Page, "body" | "metadata" | "title">> {
  const { bodyInnerHtml, headInnerHtml } = await page.evaluate(() => ({
    bodyInnerHtml: document.body.innerHTML,
    headInnerHtml: document.head.innerHTML,
  }));
  const $head = cheerio.load(headInnerHtml);
  const $body = cheerio.load(bodyInnerHtml);

  // Note: must extract metadata before cleaning HTML b/c it's soon removed
  const metadata = getMetaTags($head);

  const cleanedHtml = removeHtmlElements($body);

  const markdown = mongoDbDotcomTurndownService.turndown(cleanedHtml);

  const title = getTitle($body, $head);

  return {
    body: markdown,
    metadata,
    title,
  };
}

export const makePuppeteer = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: "new",
    // executablePath: "/opt/homebrew/bin/chromium",
  });
  const page = await browser.newPage();
  return { page, browser };
};

export async function scrapePage({
  puppeteerPage,
  url,
}: {
  puppeteerPage: PuppeteerPage;
  url: string;
}): Promise<Page> {
  // TODO: when productionizing, don't re-instantiate the browser on every call

  try {
    await puppeteerPage.goto(url, {
      waitUntil: "networkidle0",
    });
  } catch (error) {
    console.log(`failed to open the page: ${url} with the error: ${error}`);
  }

  const content = await getContent(puppeteerPage);

  return {
    url,
    format: "md",
    // TODO: hoist to dataSource param
    sourceName: "mongodb-dot-com",
    ...content,
  };
}
