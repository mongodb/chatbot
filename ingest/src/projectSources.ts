import { DevCenterProjectConfig } from "./DevCenterDataSource";
import { SnootyProjectConfig } from "./SnootyDataSource";
import { makeRstOnGitHubDataSource } from "./RstOnGitHubDataSource";
import { DataSource } from "./DataSource";
import { makeDevCenterDataSource } from "./DevCenterDataSource";
import { prepareSnootySources } from "./SnootyProjectsInfo";
import { makeGitDataSource } from "./GitDataSource";
import {
  HandleHtmlPageFuncOptions,
  handleHtmlDocument,
} from "./handleHtmlDocument";
import { makeAcquitRequireMdOnGithubDataSource } from "./AcquitRequireMdOnGithubDataSource";
import {
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
} from "./MdOnGithubDataSource";

/**
  Async constructor for specific data sources -- parameters baked in.
 */
export type SourceConstructor = () => Promise<DataSource | DataSource[]>;

// `baseUrl` and `currentBranch` to be filled in by the Snooty Data API GET
// projects endpoint - unless you want to specify one to override whatever the
// Data API says. `currentBranch` will be the name of the first branch entry has
// `isStableBranch` set to true in the Data API response.
export type LocallySpecifiedSnootyProjectConfig = Omit<
  SnootyProjectConfig,
  "baseUrl" | "currentBranch" | "version"
> & {
  baseUrl?: string;
  currentBranch?: string;
  versionNameOverride?: string;
};

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
];

export const devCenterProjectConfig: DevCenterProjectConfig = {
  type: "devcenter",
  name: "devcenter",
  collectionName: "search_content_prod",
  databaseName: "devcenter",
  baseUrl: "https://www.mongodb.com/developer",
};

export const pyMongoSourceConstructor = async () => {
  return await makeRstOnGitHubDataSource({
    name: "pymongo",
    repoUrl: "https://github.com/mongodb/mongo-python-driver",
    repoLoaderOptions: {
      branch: "master",
      ignoreFiles: [/^(?!^doc\/).*/], // Everything BUT doc/
    },
    pathToPageUrl(path) {
      return path
        .replace(/^doc\//, "https://pymongo.readthedocs.io/en/stable/")
        .replace(/\.rst$/, ".html");
    },
  });
};

const jvmDriversVersion = "4.10";
const jvmDriversHtmlToRemove = (domDoc: Document) => [
  ...Array.from(domDoc.querySelectorAll("head")),
  ...Array.from(domDoc.querySelectorAll("script")),
  ...Array.from(domDoc.querySelectorAll("noscript")),
  ...Array.from(domDoc.querySelectorAll(".sidebar")),
  ...Array.from(domDoc.querySelectorAll(".edit-link")),
  ...Array.from(domDoc.querySelectorAll(".toc")),
  ...Array.from(domDoc.querySelectorAll(".nav-items")),
  ...Array.from(domDoc.querySelectorAll(".bc")),
];
const jvmDriversExtractTitle = (domDoc: Document) => {
  const title = domDoc.querySelector("title");
  return title?.textContent ?? undefined;
};
const javaReactiveStreamsHtmlParserOptions: Omit<
  HandleHtmlPageFuncOptions,
  "sourceName"
> = {
  pathToPageUrl: (pathInRepo: string) =>
    `https://mongodb.github.io/mongo-java-driver${pathInRepo}`.replace(
      /index\.html$/,
      ""
    ),
  removeElements: jvmDriversHtmlToRemove,
  extractTitle: jvmDriversExtractTitle,
};

export const javaReactiveStreamsSourceConstructor = async () => {
  return await makeGitDataSource({
    name: "java-reactive-streams",
    repoUri: "https://github.com/mongodb/mongo-java-driver.git",
    repoOptions: {
      "--depth": 1,
      "--branch": "gh-pages",
    },
    metadata: {
      productName: "Java Reactive Streams Driver",
      version: jvmDriversVersion + " (current)",
      tags: ["docs", "driver", "java", "java-reactive-streams"],
    },
    filter: (path: string) =>
      path.endsWith(".html") &&
      path.includes(jvmDriversVersion) &&
      path.includes("driver-reactive") &&
      !path.includes("apidocs"),
    handlePage: async (path, content, options) =>
      await handleHtmlDocument(path, content, {
        ...options,
        ...javaReactiveStreamsHtmlParserOptions,
      }),
  });
};

const scalaHtmlParserOptions: Omit<HandleHtmlPageFuncOptions, "sourceName"> = {
  pathToPageUrl: (pathInRepo: string) =>
    `https://mongodb.github.io/mongo-java-driver${pathInRepo}`.replace(
      /index\.html$/,
      ""
    ),
  removeElements: jvmDriversHtmlToRemove,
  extractTitle: jvmDriversExtractTitle,
};

export const scalaSourceConstructor = async () => {
  return await makeGitDataSource({
    name: "scala",
    repoUri: "https://github.com/mongodb/mongo-java-driver.git",
    repoOptions: {
      "--depth": 1,
      "--branch": "gh-pages",
    },
    metadata: {
      productName: "Scala Driver",
      version: jvmDriversVersion + " (current)",
      tags: ["docs", "driver", "scala"],
    },
    filter: (path: string) =>
      path.endsWith(".html") &&
      path.includes(jvmDriversVersion) &&
      path.includes("driver-scala") &&
      !path.includes("apidocs"),
    handlePage: async (path, content, options) =>
      await handleHtmlDocument(path, content, {
        ...options,
        ...scalaHtmlParserOptions,
      }),
  });
};

const libmongocHtmlParserOptions: Omit<
  HandleHtmlPageFuncOptions,
  "sourceName"
> = {
  pathToPageUrl: (pathInRepo: string) =>
    `https://mongoc.org${pathInRepo}`.replace(/index\.html$/, ""),
  removeElements: (domDoc: Document) => [
    ...Array.from(domDoc.querySelectorAll("head")),
    ...Array.from(domDoc.querySelectorAll('[role="navigation"]')),
    ...Array.from(domDoc.querySelectorAll('[role="search"]')),
    ...Array.from(domDoc.querySelectorAll(".sphinxsidebar")),
  ],
  postProcessMarkdown: async (markdown: string) => markdown.replaceAll("¶", ""),
};

const libmongocVersion = "1.24.4";
export const libmongocSourceConstructor = async () => {
  return await makeGitDataSource({
    name: "c",
    repoUri: "https://github.com/mongodb/mongo-c-driver.git",
    repoOptions: {
      "--depth": 1,
      "--branch": "gh-pages",
    },
    metadata: {
      productName: "C Driver (libmongoc)",
      version: `${libmongocVersion} (current)`,
      tags: ["docs", "driver", "c", "clang", "libmongoc"],
    },
    filter: (path: string) =>
      path.includes(`libmongoc/${libmongocVersion}/`) &&
      path.endsWith(".html") &&
      !path.includes("mongoc_") && // do not include the generated reference docs
      !path.includes("search.html"), // do not include the search page
    handlePage: async (path, content, options) =>
      await handleHtmlDocument(path, content, {
        ...options,
        ...libmongocHtmlParserOptions,
      }),
  });
};
const mongooseSourceConstructor = async () => {
  const repoUrl = "https://github.com/Automattic/mongoose";
  const testFileLoaderOptions = {
    branch: "master",
    recursive: true,
    ignoreFiles: [/^(?!test\/).+$/],
  };
  const repoLoaderOptions = {
    branch: "master",
    recursive: true,
    ignoreFiles: [/^(?!docs\/).+$/],
  };
  return await makeAcquitRequireMdOnGithubDataSource({
    repoUrl,
    repoLoaderOptions,
    name: "mongoose",
    pathToPageUrl(path) {
      return path
        .replace(/^docs\//, "https://mongoosejs.com/docs/")
        .replace(/\.md$/, ".html");
    },
    testFileLoaderOptions,
    acquitCodeBlockLanguageReplacement: "javascript",
    metadata: {
      productName: "Mongoose ODM",
      tags: ["node.js", "community library", "mongoose", "odm"],
      version: "v7.x (current)",
    },
  });
};

export function mongoDbCppDriverPathToPageUrlConverter(pathInRepo: string) {
  if (pathInRepo.endsWith("_index.md")) {
    pathInRepo = pathInRepo.replace("_index.md", "index.md");
  }
  return pathInRepo
    .replace(/^docs\/content\/mongocxx-v3/, "https://mongocxx.org/mongocxx-v3")
    .replace(/\.md$/, "/");
}
export const mongoDbCppDriverConfig: MakeMdOnGithubDataSourceParams = {
  name: "cxx-driver",
  repoUrl: "https://github.com/mongodb/mongo-cxx-driver/",
  repoLoaderOptions: {
    branch: "master",
    ignoreFiles: [/^(?!^docs\/content\/mongocxx-v3\/).*/],
  },
  pathToPageUrl: mongoDbCppDriverPathToPageUrlConverter,
  metadata: {
    productName: "C++ Driver (mongocxx)",
    tags: ["docs", "driver", "c++", "cpp", "cxx", "mongocxx"],
    version: "v3.x (current)",
  },
  frontMatter: {
    process: true,
    separator: "+++",
    format: "toml",
  },
  extractTitle: (_, frontmatter) => frontmatter?.title as string,
};
const cppSourceConstructor = async () => {
  return await makeMdOnGithubDataSource(mongoDbCppDriverConfig);
};

export const mongoDbCorpDataSourceConfig: MakeMdOnGithubDataSourceParams = {
  name: "mongodb-corp",
  repoUrl: "https://github.com/mongodb/docs-chatbot/",
  repoLoaderOptions: {
    branch: "main",
    ignoreFiles: [/^(?!^mongodb-corp\/).*/, /^(mongodb-corp\/README\.md)$/],
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

export const practicalAggregationsConfig: MakeMdOnGithubDataSourceParams = {
  name: "practical-aggregations-book",
  repoUrl: "https://github.com/pkdone/practical-mongodb-aggregations-book",
  repoLoaderOptions: {
    branch: "main",
    ignoreFiles: [/^(?!^src\/).*/, /^(src\/SUMMARY\.md)$/],
  },
  pathToPageUrl(pathInRepo) {
    return (
      "https://www.practical-mongodb-aggregations.com" +
      pathInRepo.replace(/^src\//, "/").replace(/\.md$/, "")
    );
  },
  metadata: {
    bookName: "Practical MongoDB Aggregations",
    tags: ["docs", "aggregations", "book"],
  },
};
const practicalAggregationsDataSource = async () => {
  return await makeMdOnGithubDataSource(practicalAggregationsConfig);
};

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
  pyMongoSourceConstructor,
  mongooseSourceConstructor,
  cppSourceConstructor,
  mongoDbCorpDataSource,
  practicalAggregationsDataSource,
  javaReactiveStreamsSourceConstructor,
  scalaSourceConstructor,
  libmongocSourceConstructor,
];
