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
  initialWebSources,
  makeWebDataSource,
  prepareWebSources,
} from "./mongodbDotCom";
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

/**
  Predefined values for sourceType that we want to use in our Pages.
 */
export type SourceTypeName =
  | "tech-docs"
  | "devcenter"
  | "marketing"
  | "university-content"
  | "tech-docs-external"
  | "book-external";

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

export const mongoDbCorpDataSourceConfig: MakeMdOnGithubDataSourceParams<SourceTypeName> =
  {
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
  return await makeMdOnGithubDataSource<SourceTypeName>(
    mongoDbCorpDataSourceConfig
  );
};

export const mongoDbUniMetadataDataSourceConfig: MakeMdOnGithubDataSourceParams<SourceTypeName> =
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
    sourceType: "university-content",
    metadata: {
      siteTitle: "MongoDB University",
    },
  };
const mongoDbUniMetadataSource = async () => {
  return await makeMdOnGithubDataSource<SourceTypeName>(
    mongoDbUniMetadataDataSourceConfig
  );
};

export const terraformProviderSourceConfig: MakeMdOnGithubDataSourceParams<SourceTypeName> = 
  {
    name: "atlas-terraform-provider",
    repoUrl: "https://github.com/mongodb/terraform-provider-mongodbatlas.git",
    repoLoaderOptions: {
      branch: "master",
    },
    pathToPageUrl(pathInRepo, _) {
      const siteBaseUrl = "https://registry.terraform.io/providers/mongodb/mongodbatlas/latest/docs";
      return siteBaseUrl + pathInRepo.replace("docs/", "").replace(".md", "");
    },
    filter: (path: string) => path.includes("docs") && path.endsWith(".md"),
    sourceType: "tech-docs-external",
    metadata: {
      productName: "mongodbatlas Terraform Provider",
      tags: ["docs", "terraform", "atlas", "hcl"],
    },
  };
const terraformProviderDataSource = async () => {
  return await makeMdOnGithubDataSource<SourceTypeName>(terraformProviderSourceConfig);
};

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
  return webSources.map((source) =>
    makeWebDataSource({ ...source, makeBrowser })
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
  terraformProviderDataSource,
  wiredTigerSourceConstructor,
];
