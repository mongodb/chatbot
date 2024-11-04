import { MongoClient } from "mongodb-rag-core/mongodb";
import "dotenv/config";
import {
  loadBraintrustDbDocuments,
  loadBraintrustMetadata,
} from "../loadBraintrustDatasets";
import { applyCollectionIndexes } from "./applyCollectionIndexes";
import { insertCollectionDocuments } from "./insertCollectionDocuments";
import { assertEnvVars } from "mongodb-rag-core";
import { TEXT_TO_DRIVER_ENV_VARS } from "../TextToDriverEnvVars";

async function main() {
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  } = assertEnvVars(TEXT_TO_DRIVER_ENV_VARS);
  console.log("Building the databases...");
  const client = new MongoClient(MONGODB_TEXT_TO_DRIVER_CONNECTION_URI);
  try {
    const metadataDataset = await loadBraintrustMetadata({
      apiKey: BRAINTRUST_API_KEY,
      projectName: BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    });
    const dbDocs = await loadBraintrustDbDocuments({
      apiKey: BRAINTRUST_API_KEY,
      projectName: BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    });
    for (const dbMetadata of metadataDataset) {
      const { databaseName } = dbMetadata;
      for (const collectionMetadata of dbMetadata.collections) {
        const { collectionName, indexes } = collectionMetadata;
        const collectionDocs = dbDocs
          .filter(
            (doc) =>
              doc.databaseName === databaseName &&
              doc.collectionName === collectionName
          )
          .map((doc) => doc.document);
        console.log(
          `Inserting ${collectionDocs.length} documents into ${databaseName}.${collectionName}...`
        );
        await insertCollectionDocuments({
          client,
          documents: collectionDocs,
          collectionName: collectionMetadata.collectionName,
          databaseName: dbMetadata.databaseName,
          reset: true,
        });

        console.log(`Applying indexes to ${databaseName}.${collectionName}...`);

        await applyCollectionIndexes({
          client,
          collectionName,
          databaseName,
          indexes: indexes.map((idx) => ({
            name: idx.name,
            key: idx.key,
            v: idx.v,
          })),
        });
      }
    }
    console.log("Databases built!");
  } finally {
    await client.close();
    console.log("DB Connection closed.");
  }
}
main();
