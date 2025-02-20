import { strict as assert } from "assert";
import { Page, extractFrontMatter } from "mongodb-rag-core";
import {
  DataSource,
  makeGitDataSource,
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
  removeMarkdownImagesAndLinks,
} from "mongodb-rag-core/dataSources";
import { prismaSourceConstructor } from "./prisma";
import { wiredTigerSourceConstructor } from "./wiredTiger";
import { mongooseSourceConstructor } from "./mongoose";
import { practicalAggregationsDataSource } from "./practicalAggregations";
import {
  makeSnootyDataSources,
  snootyDataApiBaseUrl,
  snootyProjectConfig,
} from "./snootySources";

import { assertEnvVars } from "mongodb-rag-core";
import { PUBLIC_INGEST_ENV_VARS } from "../PublicIngestEnvVars";
import {
  DevCenterProjectConfig,
  makeDevCenterDataSource,
} from "./DevCenterDataSource";
import {
  MakeMongoDbUniversityDataSourceParams,
  makeMongoDbUniversityDataSource,
} from "./mongodb-university";
const { DEVCENTER_CONNECTION_URI, UNIVERSITY_DATA_API_KEY } = assertEnvVars(
  PUBLIC_INGEST_ENV_VARS
);
import {
  getUrlsFromSitemap,
  prepareWebSources,
  initialWebSources,
} from "./mongodbDotCom/webSources";
import { makeWebDataSource } from "./mongodbDotCom/WebDataSource";
import { chromium } from "playwright";

/**
  Async constructor for specific data sources -- parameters baked in.
 */
export type SourceConstructor = () => Promise<DataSource | DataSource[]>;

export const devCenterProjectConfig: DevCenterProjectConfig = {
  type: "devcenter",
  name: "devcenter",
  collectionName: "search_content_prod",
  databaseName: "devcenter",
  baseUrl: "https://www.mongodb.com/developer",
  connectionUri: DEVCENTER_CONNECTION_URI,
};

const mongoDbUniversitySourceConstructor = async () => {
  const universityDataApiKey = UNIVERSITY_DATA_API_KEY;
  assert(!!universityDataApiKey, "UNIVERSITY_DATA_API_KEY required");
  const universityConfig: MakeMongoDbUniversityDataSourceParams = {
    sourceName: "mongodb-university",
    baseUrl: "https://api.learn.mongodb.com/rest/catalog",
    apiKey: universityDataApiKey,
    tiCatalogItems: {
      publicOnly: true,
      nestAssociatedContent: true,
    },
  };
  return makeMongoDbUniversityDataSource(universityConfig);
};

export const mongoDbCorpDataSourceConfig: MakeMdOnGithubDataSourceParams = {
  name: "mongodb-corp",
  repoUrl: "https://github.com/mongodb/chatbot/",
  repoLoaderOptions: {
    branch: "main",
    ignoreFiles: [/^(?!^\/mongodb-corp\/).*/, /^(mongodb-corp\/README\.md)$/],
  },
  pathToPageUrl(_, frontMatter) {
    if (!frontMatter?.url) {
      throw new Error("frontMatter.url must be specified");
    }
    return frontMatter?.url as string;
  },
  extractMetadata(_, frontMatter) {
    if (!frontMatter) {
      throw new Error("frontMatter must be specified");
    }
    const frontMatterCopy = { ...frontMatter };
    delete frontMatterCopy.url;
    return frontMatterCopy;
  },
  extractTitle: (_, frontmatter) => (frontmatter?.title as string) ?? null,
};
const mongoDbCorpDataSource = async () => {
  return await makeMdOnGithubDataSource(mongoDbCorpDataSourceConfig);
};

export const mongoDbUniMetadataDataSourceConfig: MakeMdOnGithubDataSourceParams =
  {
    name: "university-meta",
    repoUrl: "https://github.com/mongodb/chatbot/",
    repoLoaderOptions: {
      branch: "main",
      ignoreFiles: [/^(?!^\/mongodb-uni\/).*/, /^(mongodb-uni\/README\.md)$/],
    },
    pathToPageUrl(_, frontMatter) {
      if (!frontMatter?.url) {
        throw new Error("frontMatter.url must be specified");
      }
      return frontMatter?.url as string;
    },
    extractMetadata(_, frontMatter) {
      if (!frontMatter) {
        throw new Error("frontMatter must be specified");
      }
      const frontMatterCopy = { ...frontMatter };
      delete frontMatterCopy.url;
      return frontMatterCopy;
    },
    extractTitle: (_, frontmatter) => (frontmatter?.title as string) ?? null,
    metadata: {
      siteTitle: "MongoDB University",
    },
  };
const mongoDbUniMetadataSource = async () => {
  return await makeMdOnGithubDataSource(mongoDbUniMetadataDataSourceConfig);
};

export const terraformProviderSourceConstructor = async () => {
  const siteBaseUrl =
    "https://registry.terraform.io/providers/mongodb/mongodbatlas/latest/docs";
  return await makeGitDataSource({
    name: "atlas-terraform-provider",
    repoUri: "https://github.com/mongodb/terraform-provider-mongodbatlas.git",
    repoOptions: {
      "--depth": 1,
      "--branch": "master",
    },
    metadata: {
      productName: "mongodbatlas Terraform Provider",
      tags: ["docs", "terraform", "atlas", "hcl"],
    },
    filter: (path: string) =>
      path.includes("website/docs") && path.endsWith(".markdown"),
    handlePage: async function (path, content) {
      const { metadata, body } = extractFrontMatter<{ page_title: string }>(
        content
      );
      const url = getTerraformPageUrl(siteBaseUrl, path);

      const page: Omit<Page, "sourceName"> = {
        body: removeMarkdownImagesAndLinks(body),
        format: "md",
        url: url,
        title: metadata?.page_title,
      };
      return page;
    },
  });
};

function getTerraformPageUrl(siteBaseUrl: string, path: string) {
  if (path.includes("website/docs/d/")) {
    return (
      siteBaseUrl +
      path.replace("website/docs/d", "data-sources").replace(".markdown", "")
    );
  } else if (path.includes("website/docs/r/")) {
    return (
      siteBaseUrl +
      path.replace("website/docs/r", "resources").replace(".markdown", "")
    );
  } else {
    return (
      siteBaseUrl + path.replace("website/docs/", "").replace(".markdown", "")
    );
  }
}

const webDataSourceConstructor = async (): Promise<DataSource[]> => {
  const sitemapUrls = await getUrlsFromSitemap(
    "https://www.mongodb.com/sitemap-pages.xml"
  );
  const webSources = await prepareWebSources({
    initialWebSources,
    sitemapUrls,
  });
  const makeBrowser = async () => {
    const browserPath = chromium.executablePath();
    const browser = await chromium.launch({
      headless: true,
      executablePath: browserPath,
    });
    const page = await browser.newPage();
    return { page, browser };
  };
  return await Promise.all(
    webSources.map((source) => makeWebDataSource({ ...source, makeBrowser }))
  );
};

/**
  The constructors for the sources used by the docs chatbot.
 */
export const sourceConstructors: SourceConstructor[] = [
  webDataSourceConstructor,
  () => makeSnootyDataSources(snootyDataApiBaseUrl, snootyProjectConfig),
  () => makeDevCenterDataSource(devCenterProjectConfig),
  mongoDbUniversitySourceConstructor,
  mongooseSourceConstructor,
  prismaSourceConstructor,
  mongoDbCorpDataSource,
  mongoDbUniMetadataSource,
  practicalAggregationsDataSource,
  terraformProviderSourceConstructor,
  wiredTigerSourceConstructor,
];
