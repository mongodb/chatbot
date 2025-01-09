import * as Puppeteer from "puppeteer";
import { makePuppeteer, scrapePage } from "./WebDataSource";
import fs from "fs";
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
];
describe("scrapePage", () => {
  let puppeteerPage: Puppeteer.Page;
  let browser: Puppeteer.Browser;
  beforeAll(async () => {
    const { page: p, browser: b } = await makePuppeteer();
    puppeteerPage = p;
    browser = b;
  });
  afterAll(async () => {
    await browser.close();
  });
  test.each(testPages)("$# $name", async ({ url, name }) => {
    const page = await scrapePage({
      url: url,
      puppeteerPage,
    });
    fs.writeFileSync(`${name}.md`, page.body);
  });
});
