import { assertEnvVars } from "chat-core";
import { DevCenterProjectConfig } from "./DevCenterDataSource";
import { SnootyProjectConfig } from "./SnootyDataSource";
import { INGEST_ENV_VARS } from "./IngestEnvVars";

const { DEVCENTER_CONNECTION_URI } = assertEnvVars(INGEST_ENV_VARS);

export const snootyProjectConfig: SnootyProjectConfig[] = [
  {
    type: "snooty",
    name: "cloud-docs",
    currentBranch: "master",
    tags: ["atlas", "docs"],
  },
  {
    type: "snooty",
    name: "cloudgov",
    currentBranch: "master",
    tags: ["atlas", "docs", "government"],
  },
  {
    // MongoDB Manual
    type: "snooty",
    name: "docs",
    currentBranch: "v6.0",
    tags: ["docs", "manual"],
  },
  {
    type: "snooty",
    name: "atlas-app-services",
    currentBranch: "master",
    tags: ["atlas", "docs", "app-services"],
  },
  {
    type: "snooty",
    name: "atlas-cli",
    currentBranch: "v1.9",
    tags: ["atlas", "docs", "cli", "atlas-cli"],
  },
  {
    type: "snooty",
    name: "bi-connector",
    currentBranch: "master",
    tags: ["bi-connector", "docs"],
  },
  {
    type: "snooty",
    name: "charts",
    currentBranch: "master",
    tags: ["charts", "docs", "atlas"],
  },
  {
    type: "snooty",
    name: "cluster-sync",
    currentBranch: "master",
    tags: ["cluster-sync", "docs"],
  },
  {
    type: "snooty",
    name: "database-tools",
    currentBranch: "master",
    tags: ["database-tools", "docs", "cli"],
  },
  {
    type: "snooty",
    name: "compass",
    currentBranch: "master",
    tags: ["compass", "docs", "gui"],
  },
  {
    type: "snooty",
    name: "csharp",
    currentBranch: "v2.20",
    tags: ["docs", "driver", "csharp"],
  },
  {
    type: "snooty",
    name: "datalake",
    currentBranch: "master",
    tags: ["datalake", "docs", "atlas"],
  },
  {
    type: "snooty",
    name: "drivers",
    currentBranch: "master",
    tags: ["docs", "driver"],
  },
  {
    type: "snooty",
    name: "golang",
    currentBranch: "v1.12",
    tags: ["docs", "driver", "golang"],
  },
  {
    type: "snooty",
    name: "java",
    currentBranch: "v4.10",
    tags: ["docs", "driver", "java", "java-sync"],
  },
  {
    type: "snooty",
    name: "kubernetes-operator",
    currentBranch: "master",
    tags: ["docs", "kubernetes-operator", "kubernetes"],
  },
  {
    type: "snooty",
    name: "kafka-connector",
    currentBranch: "v1.10",
    tags: ["docs", "kafka-connector", "kafka"],
  },
  {
    type: "snooty",
    name: "kotlin",
    currentBranch: "v4.10",
    tags: ["docs", "driver", "kotlin", "kotlin-coroutines"],
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
  },
  {
    type: "snooty",
    name: "mongodb-shell",
    currentBranch: "master",
    tags: ["docs", "cli", "mongodb-shell"],
  },
  {
    type: "snooty",
    name: "mongodb-vscode",
    currentBranch: "master",
    tags: ["docs", "mongodb-vscode", "vscode", "gui"],
  },
  {
    type: "snooty",
    name: "mongoid",
    currentBranch: "8.0",
    tags: ["docs", "driver", "mongoid", "ruby"],
  },
  {
    type: "snooty",
    name: "node",
    currentBranch: "v5.7",
    tags: ["docs", "driver", "node", "javascript"],
  },
  {
    type: "snooty",
    name: "php-library",
    currentBranch: "master",
    tags: ["docs", "driver", "php", "php-library"],
  },
  {
    type: "snooty",
    name: "realm",
    currentBranch: "master",
    tags: ["docs", "realm", "mobile", "sdk"],
  },
  {
    type: "snooty",
    name: "docs-relational-migrator",
    currentBranch: "master",
    tags: ["docs", "relational-migrator"],
  },
  {
    type: "snooty",
    name: "ruby-driver",
    currentBranch: "v2.19",
    tags: ["docs", "driver", "ruby"],
  },
  {
    type: "snooty",
    name: "spark-connector",
    currentBranch: "v10.2",
    tags: ["docs", "spark-connector", "spark", "apache-spark"],
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
  },
];

export const devCenterProjectConfig: DevCenterProjectConfig = {
  type: "devcenter",
  name: "devcenter",
  connectionUri: DEVCENTER_CONNECTION_URI,
  collectionName: "search_content_prod",
  databaseName: "devcenter",
  baseUrl: "https://www.mongodb.com/developer",
};

export const projectSourcesConfig = [
  ...snootyProjectConfig,
  devCenterProjectConfig,
];
