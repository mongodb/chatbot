---
id: "modules"
title: "mongodb-rag-ingest"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Type Aliases

### Config

Ƭ **Config**: `Object`

The configuration for ingest.

You can provide your own configuration to the ingest tool.

Every property is a function that constructs an instance (synchronously or
asynchronously). This allows you to run logic for construction or build async.
It also avoids unnecessary construction and cleanup if that field of the
config is overridden by a subsequent config.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `chunkOptions?` | [`Constructor`](modules.md#constructor)\<`Partial`\<`ChunkOptions`\>\> | Options for the chunker. |
| `dataSources` | [`Constructor`](modules.md#constructor)\<`DataSource`[]\> | The data sources that you want ingest to pull content from. |
| `embeddedContentStore` | [`Constructor`](modules.md#constructor)\<`EmbeddedContentStore`\> | The store that holds the embedded content and vector embeddings for later vector search. |
| `embedder` | [`Constructor`](modules.md#constructor)\<`Embedder`\> | The embedding function. |
| `ingestMetaStore` | [`Constructor`](modules.md#constructor)\<[`IngestMetaStore`](modules.md#ingestmetastore)\> | The store that contains the ingest meta document. The ingest meta document stores the date of the last successful run. |
| `pageStore` | [`Constructor`](modules.md#constructor)\<`PageStore`\> | The store that holds pages downloaded from data sources. |

#### Defined in

[mongodb-rag-ingest/src/Config.ts:16](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/Config.ts#L16)

___

### Constructor

Ƭ **Constructor**\<`T`\>: () => `T` \| () => `Promise`\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[mongodb-rag-ingest/src/Config.ts:50](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/Config.ts#L50)

___

### IngestMetaEntry

Ƭ **IngestMetaEntry**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_id` | `string` |
| `lastIngestDate` | `Date` |

#### Defined in

[mongodb-rag-ingest/src/IngestMetaStore.ts:40](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/IngestMetaStore.ts#L40)

___

### IngestMetaStore

Ƭ **IngestMetaStore**: `Object`

The ingest meta has information about ingest runs so that the script can
resume from a known successful run date.

If the 'since' date given to the embed command is too late, pages that were
updated during a failed run will not be picked up.

If too early, more pages and embeddings will be checked than necessary. The
embed command will not unnecessarily create new embeddings for page updates
that it has already created embeddings for, but it would still be wasteful to
have to check potentially all pages and embeddings when the date is early
enough.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `entryId` | `string` | The ID of the specific metadata document this store is associated with. Generally there should be only one document per ingest_meta collection per database. |
| `close` | () => `Promise`\<`void`\> | Closes the connection. Must be called when done. |
| `loadLastSuccessfulRunDate` | () => `Promise`\<``null`` \| `Date`\> | Returns the last successful run date for the store's entry. |
| `updateLastSuccessfulRunDate` | () => `Promise`\<`void`\> | Sets the store's entry to the current date. |

#### Defined in

[mongodb-rag-ingest/src/IngestMetaStore.ts:16](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/IngestMetaStore.ts#L16)

___

### LoadConfigArgs

Ƭ **LoadConfigArgs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `config?` | `string` |

#### Defined in

[mongodb-rag-ingest/src/withConfig.ts:6](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/withConfig.ts#L6)

___

### ResolvedConfig

Ƭ **ResolvedConfig**: \{ [K in keyof Config]: Constructed\<Config[K]\> }

Config with promises resolved.

#### Defined in

[mongodb-rag-ingest/src/withConfig.ts:96](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/withConfig.ts#L96)

## Variables

### INGEST\_ENV\_VARS

• `Const` **INGEST\_ENV\_VARS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DEVCENTER_CONNECTION_URI` | `string` |
| `MONGODB_CONNECTION_URI` | `string` |
| `MONGODB_DATABASE_NAME` | `string` |
| `NODE_ENV` | `string` |
| `OPENAI_API_KEY` | `string` |
| `OPENAI_CHAT_COMPLETION_DEPLOYMENT` | `string` |
| `OPENAI_CHAT_COMPLETION_MODEL_VERSION` | `string` |
| `OPENAI_EMBEDDING_DEPLOYMENT` | `string` |
| `OPENAI_EMBEDDING_MODEL` | `string` |
| `OPENAI_EMBEDDING_MODEL_VERSION` | `string` |
| `OPENAI_ENDPOINT` | `string` |
| `VECTOR_SEARCH_INDEX_NAME` | `string` |

#### Defined in

[mongodb-rag-ingest/src/IngestEnvVars.ts:3](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/IngestEnvVars.ts#L3)

## Functions

### loadConfig

▸ **loadConfig**(`«destructured»`): `Promise`\<[`Config`](modules.md#config)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`LoadConfigArgs`](modules.md#loadconfigargs) |

#### Returns

`Promise`\<[`Config`](modules.md#config)\>

#### Defined in

[mongodb-rag-ingest/src/withConfig.ts:10](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/withConfig.ts#L10)

___

### makeIngestMetaStore

▸ **makeIngestMetaStore**(`«destructured»`): [`IngestMetaStore`](modules.md#ingestmetastore)

Creates a connection to ingest meta collection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `connectionUri` | `string` |
| › `databaseName` | `string` |
| › `entryId` | `string` |

#### Returns

[`IngestMetaStore`](modules.md#ingestmetastore)

#### Defined in

[mongodb-rag-ingest/src/IngestMetaStore.ts:48](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/IngestMetaStore.ts#L48)

___

### withConfig

▸ **withConfig**\<`T`\>(`action`, `args`): `Promise`\<`void`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | (`config`: [`ResolvedConfig`](modules.md#resolvedconfig), `args`: `T`) => `Promise`\<`void`\> |
| `args` | [`LoadConfigArgs`](modules.md#loadconfigargs) & `T` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[mongodb-rag-ingest/src/withConfig.ts:60](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/withConfig.ts#L60)

___

### withConfigOptions

▸ **withConfigOptions**\<`T`\>(`args`): `Argv`\<`T` & [`LoadConfigArgs`](modules.md#loadconfigargs)\>

Apply config options to CLI command.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Argv`\<`T`\> |

#### Returns

`Argv`\<`T` & [`LoadConfigArgs`](modules.md#loadconfigargs)\>

#### Defined in

[mongodb-rag-ingest/src/withConfig.ts:84](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-rag-ingest/src/withConfig.ts#L84)
