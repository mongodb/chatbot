export type SnootyProject = {
  /**
    Project name as specified in Snooty Data API.
   */
  project: string;

  /**
    Url to the docs site.
   */
  baseUrl: string;
};

// TODO: Use new Snooty Data API projects endpoint. The baseUrls are not
// currently in the data and were manually added, so they might be wrong.
export const snootyProjects = [
  { project: "cloud-docs", baseUrl: "https://www.mongodb.com/docs/atlas" },
  {
    project: "atlas-open-service-broker",
    baseUrl: "https://www.mongodb.com/docs",
  },
  {
    project: "cloudgov",
    baseUrl: "https://www.mongodb.com/docs/atlas/government",
  },
  { project: "docs", baseUrl: "https://www.mongodb.com/docs/manual" },
  {
    project: "atlas-app-services",
    baseUrl: "https://www.mongodb.com/docs/atlas/app-services",
  },
  {
    project: "atlas-cli",
    baseUrl: "https://www.mongodb.com/docs/atlas/cli/stable",
  },
  {
    project: "bi-connector",
    baseUrl: "https://www.mongodb.com/docs/bi-connector/current",
  },
  { project: "charts", baseUrl: "https://www.mongodb.com/docs/charts" },
  {
    project: "cluster-sync",
    baseUrl: "https://www.mongodb.com/docs/cluster-to-cluster-sync/current",
  },
  {
    project: "database-tools",
    baseUrl: "https://www.mongodb.com/docs/database-tools",
  },
  {
    project: "compass",
    baseUrl: "https://www.mongodb.com/docs/compass/current",
  },
  {
    project: "csharp",
    baseUrl: "https://www.mongodb.com/docs/drivers/csharp/current",
  },
  {
    project: "datalake",
    baseUrl: "https://www.mongodb.com/docs/atlas/datalake",
  },
  { project: "drivers", baseUrl: "https://www.mongodb.com/docs/drivers" },
  {
    project: "golang",
    baseUrl: "https://www.mongodb.com/docs/drivers/go/current",
  },
  {
    project: "java",
    baseUrl: "https://www.mongodb.com/docs/drivers/java/sync/current",
  },
  {
    project: "kubernetes-operator",
    baseUrl: "https://www.mongodb.com/docs/kubernetes-operator/stable",
  },
  {
    project: "kafka-connector",
    baseUrl: "https://www.mongodb.com/docs/kafka-connector/current",
  },
  {
    project: "kotlin",
    baseUrl: "https://www.mongodb.com/docs/drivers/kotlin/coroutine/current",
  },
  { project: "landing", baseUrl: "https://www.mongodb.com/docs" },
  {
    project: "mongocli",
    baseUrl: "https://www.mongodb.com/docs/mongocli/stable",
  },
  {
    project: "mongodb-shell",
    baseUrl: "https://www.mongodb.com/docs/mongodb-shell",
  },
  {
    project: "mongodb-vscode",
    baseUrl: "https://www.mongodb.com/docs/mongodb-vscode",
  },
  {
    project: "mongoid",
    baseUrl: "https://www.mongodb.com/docs/mongoid/current",
  },
  {
    project: "node",
    baseUrl: "https://www.mongodb.com/docs/drivers/node/current",
  },
  {
    project: "php-library",
    baseUrl: "https://www.mongodb.com/docs/php-library/current",
  },
  { project: "realm", baseUrl: "https://www.mongodb.com/docs/realm" },
  {
    project: "docs-relational-migrator",
    baseUrl: "https://www.mongodb.com/docs/relational-migrator",
  },
  {
    project: "ruby-driver",
    baseUrl: "https://www.mongodb.com/docs/ruby-driver/current",
  },
  {
    project: "spark-connector",
    baseUrl: "https://www.mongodb.com/docs/spark-connector/current",
  },
  { project: "guides", baseUrl: "https://www.mongodb.com/docs/guides" },
];
