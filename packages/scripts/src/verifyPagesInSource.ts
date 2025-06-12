/**
  Verify that there is at least 1 page for each source in the Pages collection. 
  This acts as a sanity check that no sources failed to copy/ingest
*/
import { assertEnvVars, makeMongoDbPageStore } from "mongodb-rag-core";
import "dotenv/config";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

const excludeSources: Set<string> = new Set([
  "snooty-guides",
  "snooty-atlas-cli",
  "snooty-docs-k8s-operator",
  "snooty-c",
  "snooty-mongodb-vscode",
  "snooty-intellij",
  "snooty-entity-framework",
  "snooty-node",
  "snooty-cpp-driver",
  "snooty-csharp",
  "snooty-mongocli",
  "snooty-pymongo",
  "snooty-rust",
  "snooty-mongodb-shell",
  "snooty-django",
  "snooty-scala",
  "snooty-cloud-manager",
  "snooty-atlas-architecture",
  "snooty-charts",
  "snooty-ruby-driver",
  "snooty-cloud-docs",
  "snooty-landing",
  "snooty-golang",
  "snooty-bi-connector",
  "snooty-kafka-connector",
  "snooty-java",
  "snooty-kotlin-sync",
  "snooty-drivers",
  "snooty-mongoid",
  "snooty-cluster-sync",
  "snooty-docs-relational-migrator",
  "snooty-atlas-operator",
  "snooty-spark-connector",
  "snooty-compass",
  "snooty-ops-manager",
  "snooty-kotlin",
  "snooty-php-library",
  "snooty-cloudgov",
  "snooty-visual-studio-extension",
  "snooty-laravel",
  "snooty-database-tools",
  "snooty-pymongo-arrow",
  "snooty-java-rs",
  "mongodb-dot-com",
  "web-company",
  "web-customer-case-studies",
  "web-solutions-library",
  "web-university",
  "web-services",
]);

async function main() {
  const pageStore = await makeMongoDbPageStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
    collectionName: "pages",
  });

  /** Query the Pages collection: 
    Get all unique sourceNames where the only action type is "deleted". 
    
    Documents are shaped like:
    {
      _id: "snooty-cloud-docs"
      actions: [
        {
          action: "deleted", 
          count: 1068,
        }, 
      ] 
    }
  */
  const sourceNameDeletedCount = await pageStore.aggregatePages([
    {
      $group: {
        _id: {
          sourceName: "$sourceName",
          action: "$action",
        },
        pageCount: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.sourceName",
        actions: {
          $push: {
            action: "$_id.action",
            count: "$pageCount",
          },
        },
      },
    },
    {
      $match: {
        actions: { $size: 1 },
        "actions.action": "deleted",
      },
    },
  ]);

  const failedSources: string[] = [];
  for (let i = 0; i < sourceNameDeletedCount.length; i++) {
    if (!excludeSources.has(sourceNameDeletedCount[i]._id)) {
      failedSources.push(sourceNameDeletedCount[i]._id);
      console.log(`${sourceNameDeletedCount[i]._id} has no pages!!`);
    }
  }

  pageStore.close();

  if (failedSources.length > 0) {
    throw new Error(`The following sources have no pages: ${failedSources}`);
  } else {
    console.log("All sources have pages :)");
  }
}

main();
