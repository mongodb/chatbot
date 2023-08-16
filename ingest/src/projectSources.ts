import { DevCenterProjectConfig } from "./DevCenterDataSource";
import { SnootyProjectConfig } from "./SnootyDataSource";

// `baseUrl` and `currentBranch` to be filled in by the Snooty Data API GET
// projects endpoint - unless you want to specify one to override whatever the
// Data API says. `currentBranch` will be the name of the first branch entry has
// `isStableBranch` set to true in the Data API response.
export type LocallySpecifiedSnootyProjectConfig = Omit<
  SnootyProjectConfig,
  "baseUrl" | "currentBranch"
> & {
  baseUrl?: string;
  currentBranch?: string;
};

export const snootyProjectConfig: LocallySpecifiedSnootyProjectConfig[] = [
  {
    type: "snooty",
    name: "cloud-docs",
    currentBranch: "master",
    tags: ["atlas", "docs"],
    productName: "MongoDB Atlas",
  },
  {
    type: "snooty",
    name: "cloudgov",
    currentBranch: "master",
    tags: ["atlas", "docs", "government"],
    productName: "MongoDB Atlas for Government",
  },
  {
    // MongoDB Manual
    type: "snooty",
    name: "docs",
    currentBranch: "v6.0",
    tags: ["docs", "manual"],
    productName: "MongoDB Server",
  },
  {
    type: "snooty",
    name: "atlas-app-services",
    currentBranch: "master",
    tags: ["atlas", "docs", "app-services"],
    productName: "Atlas App Services",
  },
  {
    type: "snooty",
    name: "atlas-cli",
    currentBranch: "v1.9",
    tags: ["atlas", "docs", "cli", "atlas-cli"],
    productName: "Atlas CLI",
  },
  {
    type: "snooty",
    name: "bi-connector",
    currentBranch: "master",
    tags: ["bi-connector", "docs"],
    productName: "MongoDB Connector for BI",
  },
  {
    type: "snooty",
    name: "charts",
    currentBranch: "master",
    tags: ["charts", "docs", "atlas"],
    productName: "Atlas Charts",
  },
  {
    type: "snooty",
    name: "cluster-sync",
    currentBranch: "master",
    tags: ["cluster-sync", "docs"],
    productName: "Cluster-to-Cluster Sync",
  },
  {
    type: "snooty",
    name: "database-tools",
    currentBranch: "master",
    tags: ["database-tools", "docs", "cli"],
    productName: "MongoDB Database Tools",
  },
  {
    type: "snooty",
    name: "compass",
    currentBranch: "master",
    tags: ["compass", "docs", "gui"],
    productName: "MongoDB Compass",
  },
  {
    type: "snooty",
    name: "csharp",
    currentBranch: "v2.20",
    tags: ["docs", "driver", "csharp"],
    productName: "C# Driver",
  },
  {
    type: "snooty",
    name: "datalake",
    currentBranch: "master",
    tags: ["datalake", "docs", "atlas"],
    productName: "Atlas Data Lake",
  },
  {
    type: "snooty",
    name: "drivers",
    currentBranch: "master",
    tags: ["docs", "driver"],
    productName: "MongoDB Drivers",
  },
  {
    type: "snooty",
    name: "golang",
    currentBranch: "v1.12",
    tags: ["docs", "driver", "golang"],
    productName: "Go Driver",
  },
  {
    type: "snooty",
    name: "java",
    currentBranch: "v4.10",
    tags: ["docs", "driver", "java", "java-sync"],
    productName: "Java Driver",
  },
  {
    type: "snooty",
    name: "kubernetes-operator",
    currentBranch: "master",
    tags: ["docs", "kubernetes-operator", "kubernetes"],
    productName: "MongoDB Kubernetes Operator",
  },
  {
    type: "snooty",
    name: "kafka-connector",
    currentBranch: "v1.10",
    tags: ["docs", "kafka-connector", "kafka"],
    productName: "MongoDB Kafka Connector",
  },
  {
    type: "snooty",
    name: "kotlin",
    currentBranch: "v4.10",
    tags: ["docs", "driver", "kotlin", "kotlin-coroutines"],
    productName: "Kotlin Driver",
  },
  {
    type: "snooty",
    name: "landing",
    currentBranch: "master",
    tags: ["docs"],
  },
  {
    type: "snooty",
    name: "mongocli",
    currentBranch: "v1.30",
    tags: ["docs", "cli", "mongocli"],
    productName: "MongoDB CLI",
  },
  {
    type: "snooty",
    name: "mongodb-shell",
    currentBranch: "master",
    tags: ["docs", "cli", "mongodb-shell"],
    productName: "MongoDB Shell",
  },
  {
    type: "snooty",
    name: "mongodb-vscode",
    currentBranch: "master",
    tags: ["docs", "mongodb-vscode", "vscode", "gui"],
    productName: "MongoDB for VS Code",
  },
  {
    type: "snooty",
    name: "mongoid",
    currentBranch: "8.0",
    tags: ["docs", "driver", "mongoid", "ruby"],
    productName: "Mongoid ODM",
  },
  {
    type: "snooty",
    name: "node",
    currentBranch: "v5.7",
    tags: ["docs", "driver", "node", "javascript"],
    productName: "Node.js Driver",
  },
  {
    type: "snooty",
    name: "php-library",
    currentBranch: "master",
    tags: ["docs", "driver", "php", "php-library"],
    productName: "PHP Library",
  },
  {
    type: "snooty",
    name: "realm",
    currentBranch: "master",
    tags: ["docs", "realm", "mobile", "sdk"],
    productName: "Realm SDKs",
  },
  {
    type: "snooty",
    name: "docs-relational-migrator",
    currentBranch: "master",
    tags: ["docs", "relational-migrator"],
    productName: "MongoDB Relational Migrator",
  },
  {
    type: "snooty",
    name: "ruby-driver",
    currentBranch: "v2.19",
    tags: ["docs", "driver", "ruby"],
    productName: "Ruby Driver",
  },
  {
    type: "snooty",
    name: "spark-connector",
    currentBranch: "v10.2",
    tags: ["docs", "spark-connector", "spark", "apache-spark"],
    productName: "MongoDB Spark Connector",
  },
  {
    type: "snooty",
    name: "guides",
    currentBranch: "master",
    tags: ["docs", "guides", "tutorial"],
  },
  {
    type: "snooty",
    name: "visual-studio-extension",
    currentBranch: "v1.2",
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
