import { CreateIndexesOptions, IndexDirection } from "mongodb-rag-core/mongodb";

export interface DatabaseMetadata {
  databaseName: string;
  collections: CollectionMetadata[];
}

export interface CollectionMetadata {
  collectionName: string;
  indexes: {
    v: CreateIndexesOptions["version"];
    key: Map<string, IndexDirection>;
    name: CreateIndexesOptions["name"];
  }[];
}
