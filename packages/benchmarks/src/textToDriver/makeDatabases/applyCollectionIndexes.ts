import { MongoClient, IndexDescription } from "mongodb-rag-core/mongodb";
export async function applyCollectionIndexes({
  client,
  collectionName,
  databaseName,
  indexes,
}: {
  client: MongoClient;
  collectionName: string;
  databaseName: string;
  indexes: IndexDescription[];
}) {
  const collection = client.db(databaseName).collection(collectionName);
  await collection.createIndexes(indexes);
}
