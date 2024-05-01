import { strict as assert } from "assert";
import { Page, extractFrontMatter } from "mongodb-rag-core";
import {
  DataSource,
  makeDevCenterDataSource,
  DevCenterProjectConfig,
  makeGitDataSource,
  HandleHtmlPageFuncOptions,
  handleHtmlDocument,
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
  removeMarkdownImagesAndLinks,
  MakeMongoDbUniversityDataSourceParams,
  makeMongoDbUniversityDataSource,
  filterOnlyPublicActiveTiCatalogItems,
} from "mongodb-rag-ingest/sources";
import {
  prepareSnootySources,
  LocallySpecifiedSnootyProjectConfig,
} from "mongodb-rag-ingest/sources/snooty";
import { prismaSourceConstructor } from "./prisma";
import { wiredTigerSourceConstructor } from "./wiredTiger";
import { pyMongoSourceConstructor } from "./pyMongo";
import { mongooseSourceConstructor } from "./mongoose";
import { practicalAggregationsDataSource } from "./practicalAggregations";

/**
  Async constructor for specific data sources -- parameters baked in.
 */
export type SourceConstructor = () => Promise<DataSource | DataSource[]>;

export const snootyProjectConfig: LocallySpecifiedSnootyProjectConfig[] = [
  {
    type: "snooty",
    name: "cloud-docs",
    tags: ["atlas", "docs"],
    productName: "MongoDB Atlas",
  },
  {
    type: "snooty",
    name: "cloudgov",
    tags: ["atlas", "docs", "government"],
    productName: "MongoDB Atlas for Government",
  },
  {
    // MongoDB Manual
    type: "snooty",
    name: "docs",
    tags: ["docs", "manual"],
    productName: "MongoDB Server",
    versionNameOverride: "v7.0",
  },
  {
    type: "snooty",
    name: "atlas-app-services",
    tags: ["atlas", "docs", "app-services"],
    productName: "Atlas App Services",
  },
  {
    type: "snooty",
    name: "atlas-cli",
    tags: ["atlas", "docs", "cli", "atlas-cli"],
    productName: "Atlas CLI",
  },
  {
    type: "snooty",
    name: "bi-connector",
    tags: ["bi-connector", "docs"],
    productName: "MongoDB Connector for BI",
  },
  {
    type: "snooty",
    name: "charts",
    tags: ["charts", "docs", "atlas"],
    productName: "Atlas Charts",
  },
  {
    type: "snooty",
    name: "cluster-sync",
    tags: ["cluster-sync", "docs"],
    productName: "Cluster-to-Cluster Sync",
  },
  {
    type: "snooty",
    name: "database-tools",
    tags: ["database-tools", "docs", "cli"],
    productName: "MongoDB Database Tools",
  },
  {
    type: "snooty",
    name: "compass",
    tags: ["compass", "docs", "gui"],
    productName: "MongoDB Compass",
  },
  {
    type: "snooty",
    name: "csharp",
    tags: ["docs", "driver", "csharp"],
    productName: "C# Driver",
  },
  {
    type: "snooty",
    name: "entity-framework",
    tags: ["docs", "driver", "csharp", "entity-framework"],
    productName: "MongoDB Entity Framework Provider",
  },
  {
    type: "snooty",
    name: "datalake",
    tags: ["datalake", "docs", "atlas"],
    productName: "Atlas Data Lake",
  },
  {
    type: "snooty",
    name: "drivers",
    tags: ["docs", "driver"],
    productName: "MongoDB Drivers",
  },
  {
    type: "snooty",
    name: "golang",
    tags: ["docs", "driver", "golang"],
    productName: "Go Driver",
  },
  {
    type: "snooty",
    name: "java",
    tags: ["docs", "driver", "java", "java-sync"],
    productName: "Java Driver",
  },
  {
    type: "snooty",
    name: "kubernetes-operator",
    tags: ["docs", "kubernetes-operator", "kubernetes"],
    productName: "MongoDB Kubernetes Operator",
  },
  {
    type: "snooty",
    name: "kafka-connector",
    tags: ["docs", "kafka-connector", "kafka"],
    productName: "MongoDB Kafka Connector",
  },
  {
    type: "snooty",
    name: "kotlin",
    tags: ["docs", "driver", "kotlin", "kotlin-coroutines"],
    productName: "Kotlin Driver",
  },
  {
    type: "snooty",
    name: "landing",
    tags: ["docs"],
  },
  {
    type: "snooty",
    name: "mongocli",
    tags: ["docs", "cli", "mongocli"],
    productName: "MongoDB CLI",
  },
  {
    type: "snooty",
    name: "mongodb-shell",
    tags: ["docs", "cli", "mongodb-shell"],
    productName: "MongoDB Shell",
  },
  {
    type: "snooty",
    name: "mongodb-vscode",
    tags: ["docs", "mongodb-vscode", "vscode", "gui"],
    productName: "MongoDB for VS Code",
  },
  {
    type: "snooty",
    name: "mongoid",
    tags: ["docs", "driver", "mongoid", "ruby"],
    productName: "Mongoid ODM",
  },
  {
    type: "snooty",
    name: "node",
    tags: ["docs", "driver", "node", "javascript"],
    productName: "Node.js Driver",
  },
  {
    type: "snooty",
    name: "php-library",
    tags: ["docs", "driver", "php", "php-library"],
    productName: "PHP Library",
  },
  {
    type: "snooty",
    name: "laravel",
    tags: ["docs", "driver", "php", "laravel"],
    productName: "Laravel MongoDB",
  },
  {
    type: "snooty",
    name: "realm",
    tags: ["docs", "realm", "mobile", "sdk"],
    productName: "Realm SDKs",
  },
  {
    type: "snooty",
    name: "docs-relational-migrator",
    tags: ["docs", "relational-migrator"],
    productName: "MongoDB Relational Migrator",
  },
  {
    type: "snooty",
    name: "ruby-driver",
    tags: ["docs", "driver", "ruby"],
    productName: "Ruby Driver",
  },
  {
    type: "snooty",
    name: "spark-connector",
    tags: ["docs", "spark-connector", "spark", "apache-spark"],
    productName: "MongoDB Spark Connector",
  },
  {
    type: "snooty",
    name: "guides",
    tags: ["docs", "guides", "tutorial"],
  },
  {
    type: "snooty",
    name: "visual-studio-extension",
    tags: ["docs", "visual-studio-extension", "visual-studio", "gui"],
    productName: "MongoDB Visual Studio Extension",
  },
  {
    type: "snooty",
    name: "rust",
    tags: ["docs", "driver", "rust"],
    productName: "Rust Driver",
  },
  {
    type: "snooty",
    name: "cpp-driver",
    tags: ["docs", "driver", "cpp", "cxx", "c++"],
    productName: "C++ Driver",
  },
  {
    type: "snooty",
    name: "c-driver",
    tags: ["docs", "driver", "c", "libmongoc"],
    productName: "C Driver",
  },
  {
    type: "snooty",
    name: "scala-driver",
    tags: ["docs", "driver", "scala"],
    productName: "Scala Driver",
  },
  {
    type: "snooty",
    name: "java-reactive-streams",
    tags: ["docs", "driver", "java", "java-reactive-streams"],
    productName: "Java Reactive Streams Driver",
  },
];

export const devCenterProjectConfig: DevCenterProjectConfig = {
  type: "devcenter",
  name: "devcenter",
  collectionName: "search_content_prod",
  databaseName: "devcenter",
  baseUrl: "https://www.mongodb.com/developer",
};

const mongoDbUniversitySourceConstructor = async () => {
  const universityDataApiKey = process.env.UNIVERSITY_DATA_API_KEY;
  assert(!!universityDataApiKey, "UNIVERSITY_DATA_API_KEY required");
  const universityConfig: MakeMongoDbUniversityDataSourceParams = {
    sourceName: "mongodb-university",
    baseUrl: "https://api.learn.mongodb.com/rest/catalog",
    apiKey: universityDataApiKey,
    tiCatalogFilterFunc: filterOnlyPublicActiveTiCatalogItems,
    metadata: {
      tags: ["transcript"],
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

/**
  The constructors for the sources used by the docs chatbot.
 */
export const sourceConstructors: SourceConstructor[] = [
  () =>
    prepareSnootySources({
      projects: snootyProjectConfig,
      snootyDataApiBaseUrl: "https://snooty-data-api.mongodb.com/prod/",
    }),
  () => makeDevCenterDataSource(devCenterProjectConfig),
  mongoDbUniversitySourceConstructor,
  pyMongoSourceConstructor,
  mongooseSourceConstructor,
  prismaSourceConstructor,
  mongoDbCorpDataSource,
  practicalAggregationsDataSource,
  terraformProviderSourceConstructor,
  wiredTigerSourceConstructor,
];
