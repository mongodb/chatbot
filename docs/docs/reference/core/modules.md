---
id: "modules"
title: "mongodb-rag-core"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Interfaces

- [AzureOpenAiServiceConfig](interfaces/AzureOpenAiServiceConfig.md)
- [EmbeddedContent](interfaces/EmbeddedContent.md)

## Type Aliases

### DatabaseConnection

Ƭ **DatabaseConnection**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `close` | (`force?`: `boolean`) => `Promise`\<`void`\> |
| `drop` | () => `Promise`\<`void`\> |

#### Defined in

[packages/mongodb-rag-core/src/DatabaseConnection.ts:1](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/DatabaseConnection.ts#L1)

___

### EmbedArgs

Ƭ **EmbedArgs**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | The text to embed. |
| `userIp` | `string` | The user's IP address. Used to prevent abuse. |

#### Defined in

[packages/mongodb-rag-core/src/Embedder.ts:1](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Embedder.ts#L1)

___

### EmbedResult

Ƭ **EmbedResult**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `embedding` | `number`[] | Vector embedding of the text. |

#### Defined in

[packages/mongodb-rag-core/src/Embedder.ts:13](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Embedder.ts#L13)

___

### EmbeddedContentStore

Ƭ **EmbeddedContentStore**: `Object`

Data store of the embedded content.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `close?` | () => `Promise`\<`void`\> |
| `deleteEmbeddedContent` | (`args`: \{ `page`: [`Page`](modules.md#page)  }) => `Promise`\<`void`\> |
| `findNearestNeighbors` | (`vector`: `number`[], `options?`: `Partial`\<[`FindNearestNeighborsOptions`](modules.md#findnearestneighborsoptions)\>) => `Promise`\<[`WithScore`](modules.md#withscore)\<[`EmbeddedContent`](interfaces/EmbeddedContent.md)\>[]\> |
| `loadEmbeddedContent` | (`args`: \{ `page`: [`Page`](modules.md#page)  }) => `Promise`\<[`EmbeddedContent`](interfaces/EmbeddedContent.md)[]\> |
| `updateEmbeddedContent` | (`args`: \{ `embeddedContent`: [`EmbeddedContent`](interfaces/EmbeddedContent.md)[] ; `page`: [`Page`](modules.md#page)  }) => `Promise`\<`void`\> |

#### Defined in

[packages/mongodb-rag-core/src/EmbeddedContent.ts:59](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/EmbeddedContent.ts#L59)

___

### Embedder

Ƭ **Embedder**: `Object`

Takes a string of text and returns an array of numbers representing the
vector embedding of the text.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `embed` | (`args`: [`EmbedArgs`](modules.md#embedargs)) => `Promise`\<[`EmbedResult`](modules.md#embedresult)\> |

#### Defined in

[packages/mongodb-rag-core/src/Embedder.ts:24](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Embedder.ts#L24)

___

### FindNearestNeighborsOptions

Ƭ **FindNearestNeighborsOptions**: `Object`

Options for performing a nearest-neighbor search.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Record`\<`string`, `unknown`\> | Search filter expression. |
| `indexName` | `string` | The name of the index to use. |
| `k` | `number` | The number of nearest neighbors to return. |
| `minScore` | `number` | The minimum nearest-neighbor score threshold between 0-1. |
| `path` | `string` | The keypath to the field with the vector data to use. |

#### Defined in

[packages/mongodb-rag-core/src/EmbeddedContent.ts:97](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/EmbeddedContent.ts#L97)

___

### MakeOpenAiEmbedderArgs

Ƭ **MakeOpenAiEmbedderArgs**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `backoffOptions?` | `BackoffOptions` | Options used for automatic retry (usually due to rate limiting). |
| `deployment` | `string` | The deployment key. |
| `openAiClient` | `OpenAIClient` | The OpenAI client. |

#### Defined in

[packages/mongodb-rag-core/src/OpenAiEmbedder.ts:7](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/OpenAiEmbedder.ts#L7)

___

### MakeTypeChatJsonTranslateFuncArgs

Ƭ **MakeTypeChatJsonTranslateFuncArgs**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `azureOpenAiServiceConfig` | [`AzureOpenAiServiceConfig`](interfaces/AzureOpenAiServiceConfig.md) | Settings for using the Azure service. |
| `numRetries?` | `number` | Number of times to retry the query preprocessor if it fails. |
| `retryDelayMs?` | `number` | Delay between retries in milliseconds. |
| `schema` | `string` | The text of a .d.ts that would inform the schema. |
| `schemaName` | `string` | The name of the TypeChat schema or interface. |

#### Defined in

[packages/mongodb-rag-core/src/TypeChatJsonTranslateFunc.ts:15](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/TypeChatJsonTranslateFunc.ts#L15)

___

### Page

Ƭ **Page**: `Object`

Represents a page from a data source.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `body` | `string` | The text of the page. |
| `format` | [`PageFormat`](modules.md#pageformat) | - |
| `metadata?` | [`PageMetadata`](modules.md#pagemetadata) | Arbitrary metadata for page. |
| `sourceName` | `string` | Data source name. |
| `title?` | `string` | A human-readable title. |
| `url` | `string` | - |

#### Defined in

[packages/mongodb-rag-core/src/Page.ts:4](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Page.ts#L4)

___

### PageAction

Ƭ **PageAction**: ``"created"`` \| ``"updated"`` \| ``"deleted"``

#### Defined in

[packages/mongodb-rag-core/src/Page.ts:40](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Page.ts#L40)

___

### PageFormat

Ƭ **PageFormat**: ``"md"`` \| ``"txt"`` \| ``"openapi-yaml"``

#### Defined in

[packages/mongodb-rag-core/src/Page.ts:38](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Page.ts#L38)

___

### PageMetadata

Ƭ **PageMetadata**: `Object`

#### Index signature

▪ [k: `string`]: `unknown`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `tags?` | `string`[] | Arbitrary tags. |

#### Defined in

[packages/mongodb-rag-core/src/Page.ts:30](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Page.ts#L30)

___

### PageStore

Ƭ **PageStore**: `Object`

Data store for [Page](modules.md#page) objects.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `close?` | () => `Promise`\<`void`\> |
| `loadPages` | (`args?`: \{ `sources?`: `string`[] ; `updated?`: `Date`  }) => `Promise`\<[`PersistedPage`](modules.md#persistedpage)[]\> |
| `updatePages` | (`pages`: [`PersistedPage`](modules.md#persistedpage)[]) => `Promise`\<`void`\> |

#### Defined in

[packages/mongodb-rag-core/src/Page.ts:60](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Page.ts#L60)

___

### PersistedPage

Ƭ **PersistedPage**: [`Page`](modules.md#page) & \{ `action`: [`PageAction`](modules.md#pageaction) ; `updated`: `Date`  }

Represents a [Page](modules.md#page) stored in the database.

#### Defined in

[packages/mongodb-rag-core/src/Page.ts:45](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/Page.ts#L45)

___

### Reference

Ƭ **Reference**: `z.infer`\<typeof [`Reference`](modules.md#reference-1)\>

A formatted reference for an assistant message.

For example, a Reference might be a docs page, dev center article, or
a MongoDB University module.

#### Defined in

[packages/mongodb-rag-core/src/services/conversations.ts:9](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/conversations.ts#L9)

[packages/mongodb-rag-core/src/services/conversations.ts:10](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/conversations.ts#L10)

___

### References

Ƭ **References**: `z.infer`\<typeof [`References`](modules.md#references-1)\>

#### Defined in

[packages/mongodb-rag-core/src/services/conversations.ts:15](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/conversations.ts#L15)

[packages/mongodb-rag-core/src/services/conversations.ts:16](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/conversations.ts#L16)

___

### WithScore

Ƭ **WithScore**\<`T`\>: `T` & \{ `score`: `number`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[packages/mongodb-rag-core/src/EmbeddedContent.ts:92](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/EmbeddedContent.ts#L92)

## Variables

### CORE\_ENV\_VARS

• `Const` **CORE\_ENV\_VARS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
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

[packages/mongodb-rag-core/src/CoreEnvVars.ts:1](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/CoreEnvVars.ts#L1)

___

### Reference

• **Reference**: `ZodObject`\<\{ `title`: `ZodString` ; `url`: `ZodString`  }, ``"strip"``, `ZodTypeAny`, \{ `title`: `string` ; `url`: `string`  }, \{ `title`: `string` ; `url`: `string`  }\>

#### Defined in

[packages/mongodb-rag-core/src/services/conversations.ts:9](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/conversations.ts#L9)

[packages/mongodb-rag-core/src/services/conversations.ts:10](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/conversations.ts#L10)

___

### References

• **References**: `ZodArray`\<`ZodObject`\<\{ `title`: `ZodString` ; `url`: `ZodString`  }, ``"strip"``, `ZodTypeAny`, \{ `title`: `string` ; `url`: `string`  }, \{ `title`: `string` ; `url`: `string`  }\>, ``"many"``\>

#### Defined in

[packages/mongodb-rag-core/src/services/conversations.ts:15](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/conversations.ts#L15)

[packages/mongodb-rag-core/src/services/conversations.ts:16](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/conversations.ts#L16)

___

### logger

• `Const` **logger**: `Logger`

#### Defined in

[packages/mongodb-rag-core/src/services/logger.ts:44](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/logger.ts#L44)

## Functions

### assertEnvVars

▸ **assertEnvVars**\<`T`\>(`ENV_VARS`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `string`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `ENV_VARS` | `T` |

#### Returns

`T`

#### Defined in

[packages/mongodb-rag-core/src/assertEnvVars.ts:1](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/assertEnvVars.ts#L1)

___

### createLoggerMessage

▸ **createLoggerMessage**(`«destructured»`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `CreateMessageParams` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `ipAddress` | `undefined` \| `string` |
| `message` | `string` |
| `requestBody` | `any` |
| `requestId` | `undefined` \| `string` |

#### Defined in

[packages/mongodb-rag-core/src/services/logger.ts:10](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/services/logger.ts#L10)

___

### extractFrontMatter

▸ **extractFrontMatter**\<`T`\>(`text`, `language?`, `delimiter?`): `Object`

This function extracts frontmatter from a string.
The generic type does not validate that the frontmatter
conforms to the type. It just provides the type
for developer convenience.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `unknown`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `language?` | `string` |
| `delimiter?` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `body` | `string` |
| `metadata?` | `T` |

#### Defined in

[packages/mongodb-rag-core/src/extractFrontMatter.ts:10](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/extractFrontMatter.ts#L10)

___

### filterDefined

▸ **filterDefined**\<`T`\>(`array`): `Exclude`\<`T`, `undefined`\>[]

Given an array of possibly undefined T, return those that are defined.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `array` | `T`[] |

#### Returns

`Exclude`\<`T`, `undefined`\>[]

#### Defined in

[packages/mongodb-rag-core/src/arrayFilters.ts:14](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/arrayFilters.ts#L14)

___

### filterFulfilled

▸ **filterFulfilled**\<`T`\>(`array`): `PromiseFulfilledResult`\<`T`\>[]

Given an array of PromiseSettledResults, return those that are fulfilled as PromiseFulfilledResults.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `array` | `PromiseSettledResult`\<`T`\>[] |

#### Returns

`PromiseFulfilledResult`\<`T`\>[]

#### Defined in

[packages/mongodb-rag-core/src/arrayFilters.ts:4](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/arrayFilters.ts#L4)

___

### makeMongoDbEmbeddedContentStore

▸ **makeMongoDbEmbeddedContentStore**(`«destructured»`): [`EmbeddedContentStore`](modules.md#embeddedcontentstore) & [`DatabaseConnection`](modules.md#databaseconnection)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `MakeMongoDbDatabaseConnectionParams` |

#### Returns

[`EmbeddedContentStore`](modules.md#embeddedcontentstore) & [`DatabaseConnection`](modules.md#databaseconnection)

#### Defined in

[packages/mongodb-rag-core/src/MongoDbEmbeddedContentStore.ts:15](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/MongoDbEmbeddedContentStore.ts#L15)

___

### makeMongoDbPageStore

▸ **makeMongoDbPageStore**(`«destructured»`): [`PageStore`](modules.md#pagestore) & [`DatabaseConnection`](modules.md#databaseconnection)

Data store for [Page](modules.md#page) objects using MongoDB.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `MakeMongoDbDatabaseConnectionParams` |

#### Returns

[`PageStore`](modules.md#pagestore) & [`DatabaseConnection`](modules.md#databaseconnection)

#### Defined in

[packages/mongodb-rag-core/src/MongoDbPageStore.ts:13](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/MongoDbPageStore.ts#L13)

___

### makeOpenAiEmbedder

▸ **makeOpenAiEmbedder**(`«destructured»`): [`Embedder`](modules.md#embedder)

Constructor for implementation of the [Embedder](modules.md#embedder) using [OpenAI
Embeddings API](https://platform.openai.com/docs/guides/embeddings).

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`MakeOpenAiEmbedderArgs`](modules.md#makeopenaiembedderargs) |

#### Returns

[`Embedder`](modules.md#embedder)

#### Defined in

[packages/mongodb-rag-core/src/OpenAiEmbedder.ts:28](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/OpenAiEmbedder.ts#L28)

___

### makeTypeChatJsonTranslateFunc

▸ **makeTypeChatJsonTranslateFunc**\<`SchemaType`\>(`«destructured»`): (`prompt`: `string`) => `Promise`\<`SchemaType`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `SchemaType` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`MakeTypeChatJsonTranslateFuncArgs`](modules.md#maketypechatjsontranslatefuncargs) |

#### Returns

`fn`

▸ (`prompt`): `Promise`\<`SchemaType`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `prompt` | `string` |

##### Returns

`Promise`\<`SchemaType`\>

#### Defined in

[packages/mongodb-rag-core/src/TypeChatJsonTranslateFunc.ts:42](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/TypeChatJsonTranslateFunc.ts#L42)

___

### removeFrontMatter

▸ **removeFrontMatter**(`content`, `options?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `string` |
| `options?` | `FrontMatterOptions` |

#### Returns

`string`

#### Defined in

[packages/mongodb-rag-core/src/removeFrontMatter.ts:2](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/removeFrontMatter.ts#L2)

___

### updateFrontMatter

▸ **updateFrontMatter**(`text`, `metadataIn`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `metadataIn` | `Record`\<`string`, `unknown`\> |

#### Returns

`string`

#### Defined in

[packages/mongodb-rag-core/src/updateFrontMatter.ts:4](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-rag-core/src/updateFrontMatter.ts#L4)
