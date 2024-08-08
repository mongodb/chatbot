import {
  Db,
  IndexSpecification,
  Collection,
  CreateIndexesOptions,
} from "mongodb-rag-core";

export type IndexDefinition = {
  spec: IndexSpecification;
  options?: CreateIndexesOptions;
  name?: string;
};

export type EnsureCollectionWithIndexParams = {
  db: Db;
  collectionName: string;
} & ({ index: IndexDefinition } | { indexes: IndexDefinition[] });

export async function ensureCollectionWithIndex({
  db,
  collectionName,
  ...indexProps
}: EnsureCollectionWithIndexParams) {
  console.log("Ensuring collection with index:", {
    collectionName,
    ...indexProps,
  });
  const existingCollections = await db
    .listCollections({ name: collectionName })
    .toArray();
  console.log("Existing collections:", existingCollections);
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
      collection,
      index: index.spec,
      options: index.options,
    });
  }
  return collection;
}

export async function ensureIndex({
  collection,
  index,
  options,
}: {
  collection: Collection;
  index: IndexSpecification;
  options?: CreateIndexesOptions;
}) {
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
  // The week starts on Monday
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
