import { MongoClient, Document } from "mongodb-rag-core/mongodb";

export async function insertCollectionDocuments({
  client,
  documents,
  collectionName,
  databaseName,
  reset = false,
}: {
  client: MongoClient;
  documents: Document[];
  collectionName: string;
  databaseName: string;
  reset?: boolean;
}) {
  const collection = client.db(databaseName).collection(collectionName);
  if (reset) {
    console.log(
      `Deleting all existing documents from ${databaseName}.${collectionName} before insert...`
    );
    await collection.deleteMany({});
  }
  await collection.insertMany(documents);
}
