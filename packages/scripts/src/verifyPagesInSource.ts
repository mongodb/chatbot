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

async function main() {
  const pageStore = await makeMongoDbPageStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
    collectionName: "pages",
  });

  pageStore.aggregatePages([{ $group: { _id: "$sourceName" }}]);

  /** Query the Pages collection: 
    Get all unique sourceNames. 
    Count pages in each sourceName by action type (created/updated/deleted).

    sourceNameCount documents are shaped like:
    {
      _id: "snooty-cloud-docs"
      actions: [
        {
          action: "created", 
          count: 1068,
        }, 
        {
          action: "updated", 
          count: 1068,
        }, 
        {
          action: "deleted", 
          count: 1068,
        }, 
      ] 
    }
  */
  const sourceNameCount = await pageStore.aggregatePages([
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
  ]);

  const failedSources: string[] = [];
  for (let i = 0; i < sourceNameCount.length; i++) {
    if (
      sourceNameCount[i].actions.length === 1 &&
      sourceNameCount[i].actions[0].action === "deleted"
    ) {
      failedSources.push(sourceNameCount[i]._id);
      console.log(`${sourceNameCount[i]._id} has no pages!!`);
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
