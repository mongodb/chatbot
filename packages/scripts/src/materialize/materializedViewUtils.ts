import {
  IndexSpecification,
  CreateIndexesOptions,
  MongoClient,
} from "mongodb-rag-core/mongodb";

export type IndexDefinition = {
  spec: IndexSpecification;
  options?: CreateIndexesOptions;
  name?: string;
};

export type EnsureCollectionWithIndexParams = {
  client: MongoClient;
  databaseName: string;
  collectionName: string;
} & ({ index: IndexDefinition } | { indexes: IndexDefinition[] });

export async function ensureCollectionWithIndex({
  client,
  databaseName,
  collectionName,
  ...indexProps
}: EnsureCollectionWithIndexParams) {
  console.log("Ensuring collection with index:", {
    collectionName,
    ...indexProps,
  });
  await client.connect();
  const db = client.db(databaseName);
  const existingCollections = await db
    .listCollections({ name: collectionName })
    .toArray();
  const collectionExists = existingCollections.some(
    (collection) => collection.name === collectionName
  );
  const collection = collectionExists
    ? db.collection(collectionName)
    : await db.createCollection(collectionName);
  const indexesToCreate =
    "index" in indexProps ? [indexProps.index] : indexProps.indexes;
  for (const index of indexesToCreate) {
    console.log("Ensuring index:", index);
    await ensureIndex({
      client,
      databaseName,
      collectionName,
      index: index.spec,
      options: index.options,
    });
  }
  return collection;
}

export async function ensureIndex({
  client,
  databaseName,
  collectionName,
  index,
  options,
}: {
  client: MongoClient;
  databaseName: string;
  collectionName: string;
  index: IndexSpecification;
  options?: CreateIndexesOptions;
}) {
  await client.connect();
  const collection = client.db(databaseName).collection(collectionName);
  const existingIndexes = await collection.listIndexes().toArray();
  const indexExists = existingIndexes.some((existingIndex) => {
    return JSON.stringify(existingIndex.key) === JSON.stringify(index);
  });
  if (!indexExists) {
    await collection.createIndex(index, options);
    console.log("Index created:", { index, options });
  }
}

// Date utils
export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0));
}

export function startOfWeek(
  date: Date,
  weekStartsOn: "sunday" | "monday" = "sunday"
) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay() + (weekStartsOn === "sunday" ? 0 : 1),
      0,
      0,
      0,
      0
    )
  );
}

export function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  );
}
