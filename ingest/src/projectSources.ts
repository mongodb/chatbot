import { DevCenterProjectConfig } from "./DevCenterDataSource";
import { SnootyProjectConfig } from "./SnootyDataSource";

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

export const projectSourcesConfig = [
  ...snootyProjectConfig,
  devCenterProjectConfig,
];
