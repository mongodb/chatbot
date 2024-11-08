/**
  @fileoverview This file contains the data source for pulling mongodb.com/*
  pages from the mongodb.com CMS.
  Note: doesn't include mongodb.com/docs/* pages.
 */
import { DataSource } from "mongodb-rag-core/dataSources";
import { Page } from "mongodb-rag-core";
import { strict as assert } from "assert";
import striptags from "striptags";
import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";

export function makeMongoDbDotComDataSource({
  connectionUri,
  dbName,
  maxPages,
}: {
  connectionUri: string;
  dbName: string;
  maxPages?: number; // for testing
}): DataSource {
  return {
    name: "mongodb-dot-com",
    async fetchPages() {
      const mongodb = new MongoClient(connectionUri);
      try {
        const query = mongodb
          .db(dbName)
          .collection<CustomerPage>("nodes")
          .find({
            // url: { $regex: 'customers/' },
            status: "published",
            locale: "en",
            $or: [
              {
                $and: [
                  { body: { $exists: true, $ne: null } },
                  { body: { $ne: "" } },
                ],
              },
              { components: { $exists: true, $ne: null } },
            ],
          });
        if (maxPages) {
          query.limit(maxPages);
        }
        const customerPages = await query.toArray();

        const parsedCustomerPages = customerPages.map((customerPage) =>
          parseCustomerPage({
            input: customerPage,
            sourceName: "mongodb-dot-com",
            baseUrl: "https://www.mongodb.com/",
          })
        );

        return parsedCustomerPages;
      } finally {
        await mongodb.close();
      }
    },
  };
}

interface CustomerPage {
  status: string;
  title: string;
  url: string;
  body?: string | null;
  summary?: string;
  tag_ids?: ObjectId[];
  components?: DotComCmsComponent[] | null;
}

interface DotComCmsComponent {
  key: string;
  props?: Record<string, unknown>;
  content?: string;
  title?: string;
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  h5?: string;
  h6?: string;
  [key: string]: string | Record<string, unknown> | undefined;
}

function parseCustomerPage({
  input,
  sourceName,
  baseUrl,
}: {
  input: CustomerPage;
  sourceName: string;
  baseUrl: string;
}): Page {
  // assert(
  //   input.body ?? input.components,
  //   "input must have `body` or `components`"
  // );
  const url = makePageUrl(baseUrl, input.url);
  const title = makePageTitle(input);
  const body = makePageBody(input);
  return {
    url,
    title,
    body,
    format: "md",
    sourceName,
  };
}

function makePageUrl(baseUrl: string, urlSlug: string): string {
  const cleanedUrlSlug = urlSlug.startsWith("/") ? urlSlug.slice(1) : urlSlug;
  const cleanedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanedBaseUrl}/${cleanedUrlSlug}`;
}
function makePageTitle(input: CustomerPage): string | undefined {
  // easy case
  if (input.title) {
    return input.title;
  }
  // recurse!
  if (input.components) {
    return findPageTitleInTree(
      input.components as unknown as DotComCmsComponent
    );
  }
}
function findPageTitleInTree(tree: DotComCmsComponent): string | undefined {
  for (const key in tree) {
    const value = tree[key];
    if (key === "h1" && typeof value === "string") {
      return value;
    }
    if (typeof value === "object") {
      const foundTitle = findPageTitleInTree(value as DotComCmsComponent);
      if (foundTitle) {
        return foundTitle;
      }
    }
  }
}

function makePageBody(input: CustomerPage): string {
  if (!(input.body ?? input.components)) {
    return "🤷";
  }
  assert(
    input.body ?? input.components,
    "input must have `body` or `components`"
  );
  const pageBody = input.body
    ? input.body
    : // TODO: see if i can simplify w/o the map..i think can do parseCustomerPageRecursiveHelper(input.components)
      // and this would work
      input.components
        ?.map((component) => {
          return parseCustomerPageRecursiveHelper(component);
        })
        .join("\n\n")
        .replaceAll(/\n{2,}/g, "\n\n")
        .trim();
  if (!pageBody) {
    return "🤷";
  }
  assert(pageBody, "pageBody must be defined per above logic");
  return removeMarkdownImagesAndLinks(striptags(pageBody));
}

function removeMarkdownImagesAndLinks(content: string): string {
  const mdLink = /!?\[([\s\S]*?)\]\([\s\S]*?\)/g;

  let cleanedContent = content.replaceAll(mdLink, (match, text) => {
    // remove images
    if (match.startsWith("!")) {
      return "";
    } else return text;
  });
  // remove unnecessary new lines
  cleanedContent = cleanedContent.replaceAll(/\n{3,}/g, "\n\n");

  return cleanedContent;
}

function parseCustomerPageRecursiveHelper(
  tree: DotComCmsComponent,
  result = ""
): string {
  // do not process Nav or Footer components
  if (tree.key === "Nav" || tree.key === "Footer") {
    return "";
  }

  if (tree.h1) {
    result += `# ${tree.h1}\n\n`;
  }
  if (tree.h2) {
    result += `## ${tree.h2}\n\n`;
  }
  if (tree.h3) {
    result += `### ${tree.h3}\n\n`;
  }
  if (tree.h4) {
    result += `#### ${tree.h4}\n\n`;
  }
  if (tree.h5) {
    result += `##### ${tree.h5}\n\n`;
  }
  if (tree.h6) {
    result += `###### ${tree.h6}\n\n`;
  }
  if (tree.title) {
    result += `${tree.title}\n\n`;
  }
  if (tree.content) {
    result += `${tree.content}\n\n`;
  }
  for (const property in tree) {
    const value = tree[property];
    if (typeof value === "object") {
      result += parseCustomerPageRecursiveHelper(value as DotComCmsComponent);
    }
  }
  return result.replaceAll(/\n{2,}/g, "\n\n");
}
