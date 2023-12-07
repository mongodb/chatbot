---
id: "modules"
title: "mongodb-chatbot-server"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Interfaces

- [AppConfig](interfaces/AppConfig.md)
- [AzureOpenAiServiceConfig](interfaces/AzureOpenAiServiceConfig.md)
- [ChatLlm](interfaces/ChatLlm.md)
- [Conversation](interfaces/Conversation.md)
- [ConversationConstants](interfaces/ConversationConstants.md)
- [ConversationsRateLimitConfig](interfaces/ConversationsRateLimitConfig.md)
- [ConversationsRouterLocals](interfaces/ConversationsRouterLocals.md)
- [ConversationsRouterParams](interfaces/ConversationsRouterParams.md)
- [ConversationsService](interfaces/ConversationsService.md)
- [DataStreamer](interfaces/DataStreamer.md)
- [EmbeddedContent](interfaces/EmbeddedContent.md)
- [FindByIdParams](interfaces/FindByIdParams.md)
- [LlmAnswerQuestionParams](interfaces/LlmAnswerQuestionParams.md)
- [MakeOpenAiChatLlmParams](interfaces/MakeOpenAiChatLlmParams.md)
- [OpenAiChatMessage](interfaces/OpenAiChatMessage.md)
- [RateMessageParams](interfaces/RateMessageParams.md)
- [SearchBooster](interfaces/SearchBooster.md)

## Type Aliases

### AddAssistantMessageParams

Ƭ **AddAssistantMessageParams**: `Omit`\<[`AssistantMessage`](modules.md#assistantmessage), ``"id"`` \| ``"createdAt"``\> & \{ `conversationId`: `ObjectId`  }

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:111](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L111)

___

### AddConversationMessageParams

Ƭ **AddConversationMessageParams**: [`AddSystemMessageParams`](modules.md#addsystemmessageparams) \| [`AddUserMessageParams`](modules.md#addusermessageparams) \| [`AddAssistantMessageParams`](modules.md#addassistantmessageparams)

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:118](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L118)

___

### AddCustomDataFunc

Ƭ **AddCustomDataFunc**: (`request`: `Request`, `response`: `Response`\<`any`, [`ConversationsRouterLocals`](interfaces/ConversationsRouterLocals.md)\>) => `Promise`\<[`ConversationCustomData`](modules.md#conversationcustomdata)\>

#### Type declaration

▸ (`request`, `response`): `Promise`\<[`ConversationCustomData`](modules.md#conversationcustomdata)\>

Function to add custom data to the [Conversation](interfaces/Conversation.md) persisted to the database.
Has access to the Express.js request and response plus the [ConversationsRouterLocals](interfaces/ConversationsRouterLocals.md)
from the Response.locals object.

##### Parameters

| Name | Type |
| :------ | :------ |
| `request` | `Request` |
| `response` | `Response`\<`any`, [`ConversationsRouterLocals`](interfaces/ConversationsRouterLocals.md)\> |

##### Returns

`Promise`\<[`ConversationCustomData`](modules.md#conversationcustomdata)\>

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:62](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L62)

___

### AddSystemMessageParams

Ƭ **AddSystemMessageParams**: `Omit`\<[`SystemMessage`](modules.md#systemmessage), ``"id"`` \| ``"createdAt"``\> & \{ `conversationId`: `ObjectId`  }

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:102](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L102)

___

### AddUserMessageParams

Ƭ **AddUserMessageParams**: `Omit`\<[`UserMessage`](modules.md#usermessage), ``"id"`` \| ``"createdAt"``\> & \{ `conversationId`: `ObjectId` ; `customData?`: `Record`\<`string`, `unknown`\>  }

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:106](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L106)

___

### AssistantMessage

Ƭ **AssistantMessage**: [`Message`](modules.md#message) & \{ `rating?`: `boolean` ; `references`: `any`[] ; `role`: ``"assistant"``  }

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:36](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L36)

___

### ConversationCustomData

Ƭ **ConversationCustomData**: `Record`\<`string`, `unknown`\> \| `undefined`

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:76](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L76)

___

### ConversationsMiddleware

Ƭ **ConversationsMiddleware**: `RequestHandler`\<`ParamsDictionary`, `any`, `any`, `any`, [`ConversationsRouterLocals`](interfaces/ConversationsRouterLocals.md)\>

Middleware to put in front of all the routes in the conversationsRouter.
This middleware is useful for things like authentication, data validation, etc.
It exposes the app's [ConversationsService](interfaces/ConversationsService.md).
It also lets you access [ConversationsRouterLocals](interfaces/ConversationsRouterLocals.md) via Response.locals
([docs](https://expressjs.com/en/api.html#res.locals)).
You can use the locals in other middleware or persist when you create the conversation
with the `POST /conversations` endpoint with the [AddCustomDataFunc](modules.md#addcustomdatafunc).

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:85](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L85)

___

### CreateConversationParams

Ƭ **CreateConversationParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `customData?` | [`ConversationCustomData`](modules.md#conversationcustomdata) |

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:98](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L98)

___

### DatabaseConnection

Ƭ **DatabaseConnection**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `close` | (`force?`: `boolean`) => `Promise`\<`void`\> |
| `drop` | () => `Promise`\<`void`\> |

#### Defined in

packages/mongodb-rag-core/build/DatabaseConnection.d.ts:1

___

### EmbedArgs

Ƭ **EmbedArgs**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | The text to embed. |
| `userIp` | `string` | The user's IP address. Used to prevent abuse. |

#### Defined in

packages/mongodb-rag-core/build/Embedder.d.ts:1

___

### EmbedResult

Ƭ **EmbedResult**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `embedding` | `number`[] | Vector embedding of the text. |

#### Defined in

packages/mongodb-rag-core/build/Embedder.d.ts:11

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

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:52

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

packages/mongodb-rag-core/build/Embedder.d.ts:21

___

### FindContentFunc

Ƭ **FindContentFunc**: (`args`: [`FindContentFuncArgs`](modules.md#findcontentfuncargs)) => `Promise`\<[`FindContentResult`](modules.md#findcontentresult)\>

#### Type declaration

▸ (`args`): `Promise`\<[`FindContentResult`](modules.md#findcontentresult)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`FindContentFuncArgs`](modules.md#findcontentfuncargs) |

##### Returns

`Promise`\<[`FindContentResult`](modules.md#findcontentresult)\>

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts:16](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts#L16)

___

### FindContentFuncArgs

Ƭ **FindContentFuncArgs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ipAddress` | `string` |
| `query` | `string` |

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts:11](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts#L11)

___

### FindContentResult

Ƭ **FindContentResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content` | [`WithScore`](modules.md#withscore)\<[`EmbeddedContent`](interfaces/EmbeddedContent.md)\>[] |
| `queryEmbedding` | `number`[] |

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts:20](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts#L20)

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

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:87

___

### GenerateUserPrompt

Ƭ **GenerateUserPrompt**: (`params`: [`GenerateUserPromptParams`](modules.md#generateuserpromptparams)) => `Promise`\<[`OpenAiChatMessage`](interfaces/OpenAiChatMessage.md) & \{ `role`: ``"user"``  }\>

#### Type declaration

▸ (`params`): `Promise`\<[`OpenAiChatMessage`](interfaces/OpenAiChatMessage.md) & \{ `role`: ``"user"``  }\>

Generate the user prompt sent to the [ChatLlm](interfaces/ChatLlm.md).
This should include the content from vector search.

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`GenerateUserPromptParams`](modules.md#generateuserpromptparams) |

##### Returns

`Promise`\<[`OpenAiChatMessage`](interfaces/OpenAiChatMessage.md) & \{ `role`: ``"user"``  }\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/openAiChatLlm.ts:19](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/openAiChatLlm.ts#L19)

___

### GenerateUserPromptParams

Ƭ **GenerateUserPromptParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `chunks` | `string`[] |
| `question` | `string` |

#### Defined in

[packages/mongodb-chatbot-server/src/services/openAiChatLlm.ts:11](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/openAiChatLlm.ts#L11)

___

### MakeDefaultFindContentFuncArgs

Ƭ **MakeDefaultFindContentFuncArgs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `embedder` | [`Embedder`](modules.md#embedder) |
| `findNearestNeighborsOptions?` | `Partial`\<[`FindNearestNeighborsOptions`](modules.md#findnearestneighborsoptions)\> |
| `searchBoosters?` | [`SearchBooster`](interfaces/SearchBooster.md)[] |
| `store` | [`EmbeddedContentStore`](modules.md#embeddedcontentstore) |

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts:25](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts#L25)

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

packages/mongodb-rag-core/build/OpenAiEmbedder.d.ts:4

___

### MakeReferenceLinksFunc

Ƭ **MakeReferenceLinksFunc**: (`chunks`: [`EmbeddedContent`](interfaces/EmbeddedContent.md)[]) => `any`[]

#### Type declaration

▸ (`chunks`): `any`[]

Function that generates the references in the response to user.

##### Parameters

| Name | Type |
| :------ | :------ |
| `chunks` | [`EmbeddedContent`](interfaces/EmbeddedContent.md)[] |

##### Returns

`any`[]

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/addMessageToConversation.ts:482](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/addMessageToConversation.ts#L482)

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

packages/mongodb-rag-core/build/TypeChatJsonTranslateFunc.d.ts:7

___

### Message

Ƭ **Message**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `content` | `string` | Message that occurs in the conversation. |
| `createdAt` | `Date` | The date the message was created. |
| `customData?` | `Record`\<`string`, `unknown`\> | Custom data to include in the Message persisted to the database. |
| `id` | `ObjectId` | Unique identifier for the message. |
| `role` | [`OpenAiMessageRole`](modules.md#openaimessagerole) | The role of the message in the conversation. |

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:5](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L5)

___

### OpenAIChatCompletionWithoutUsage

Ƭ **OpenAIChatCompletionWithoutUsage**: `Omit`\<`ChatCompletions`, ``"usage"``\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:29](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L29)

___

### OpenAiAwaitedResponse

Ƭ **OpenAiAwaitedResponse**: [`OpenAiChatMessage`](interfaces/OpenAiChatMessage.md)

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:33](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L33)

___

### OpenAiMessageRole

Ƭ **OpenAiMessageRole**: ``"system"`` \| ``"assistant"`` \| ``"user"``

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:8](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L8)

___

### OpenAiStreamingResponse

Ƭ **OpenAiStreamingResponse**: `AsyncIterable`\<[`OpenAIChatCompletionWithoutUsage`](modules.md#openaichatcompletionwithoutusage)\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:31](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L31)

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

packages/mongodb-rag-core/build/Page.d.ts:4

___

### PageAction

Ƭ **PageAction**: ``"created"`` \| ``"updated"`` \| ``"deleted"``

#### Defined in

packages/mongodb-rag-core/build/Page.d.ts:32

___

### PageFormat

Ƭ **PageFormat**: ``"md"`` \| ``"txt"`` \| ``"openapi-yaml"``

#### Defined in

packages/mongodb-rag-core/build/Page.d.ts:31

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

packages/mongodb-rag-core/build/Page.d.ts:24

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

packages/mongodb-rag-core/build/Page.d.ts:49

___

### PersistedPage

Ƭ **PersistedPage**: [`Page`](modules.md#page) & \{ `action`: [`PageAction`](modules.md#pageaction) ; `updated`: `Date`  }

Represents a [Page](modules.md#page) stored in the database.

#### Defined in

packages/mongodb-rag-core/build/Page.d.ts:36

___

### QueryPreprocessorFunc

Ƭ **QueryPreprocessorFunc**\<`ReturnType`\>: (`params`: [`QueryProcessorFuncParams`](modules.md#queryprocessorfuncparams)) => `Promise`\<`ReturnType`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnType` | extends [`QueryPreprocessorResult`](modules.md#querypreprocessorresult) = [`QueryPreprocessorResult`](modules.md#querypreprocessorresult) |

#### Type declaration

▸ (`params`): `Promise`\<`ReturnType`\>

Query preprocessors transform an input query to a new query based on your
business logic.

If the preprocessor can't transform the query, it may return undefined. The
preprocessor may also suggest not answering with the rejectQuery field in the
return value (for example, if the query disparages your company, you might
want to send a canned response).

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryProcessorFuncParams`](modules.md#queryprocessorfuncparams) |

##### Returns

`Promise`\<`ReturnType`\>

#### Defined in

[packages/mongodb-chatbot-server/src/processors/QueryPreprocessorFunc.ts:17](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/processors/QueryPreprocessorFunc.ts#L17)

___

### QueryPreprocessorResult

Ƭ **QueryPreprocessorResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `query?` | `string` |
| `rejectQuery` | `boolean` |

#### Defined in

[packages/mongodb-chatbot-server/src/processors/QueryPreprocessorFunc.ts:21](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/processors/QueryPreprocessorFunc.ts#L21)

___

### QueryProcessorFuncParams

Ƭ **QueryProcessorFuncParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `messages` | [`Message`](modules.md#message)[] |
| `query?` | `string` |

#### Defined in

[packages/mongodb-chatbot-server/src/processors/QueryPreprocessorFunc.ts:3](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/processors/QueryPreprocessorFunc.ts#L3)

___

### Reference

Ƭ **Reference**: `z.infer`\<typeof [`Reference`](modules.md#reference-1)\>

A formatted reference for an assistant message.

For example, a Reference might be a docs page, dev center article, or
a MongoDB University module.

#### Defined in

packages/mongodb-rag-core/build/services/conversations.d.ts:8

packages/mongodb-rag-core/build/services/conversations.d.ts:9

___

### References

Ƭ **References**: `z.infer`\<typeof [`References`](modules.md#references-1)\>

#### Defined in

packages/mongodb-rag-core/build/services/conversations.d.ts:19

packages/mongodb-rag-core/build/services/conversations.d.ts:20

___

### SomeMessage

Ƭ **SomeMessage**: [`UserMessage`](modules.md#usermessage) \| [`AssistantMessage`](modules.md#assistantmessage) \| [`SystemMessage`](modules.md#systemmessage)

Message in the [Conversation](interfaces/Conversation.md) as stored in the database.

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:74](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L74)

___

### SystemMessage

Ƭ **SystemMessage**: [`Message`](modules.md#message) & \{ `role`: ``"system"``  }

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:32](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L32)

___

### SystemPrompt

Ƭ **SystemPrompt**: [`OpenAiChatMessage`](interfaces/OpenAiChatMessage.md) & \{ `role`: ``"system"``  }

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:22](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L22)

___

### UserMessage

Ƭ **UserMessage**: [`Message`](modules.md#message) & \{ `embedding`: `number`[] ; `preprocessedContent?`: `string` ; `rejectQuery?`: `boolean` ; `role`: ``"user"``  }

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:52](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L52)

___

### WithFilterAndK

Ƭ **WithFilterAndK**\<`T`\>: `T` & \{ `filter`: `Record`\<`string`, `unknown`\> ; `k`: `number`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[packages/mongodb-chatbot-server/src/processors/makeBoostOnAtlasSearchFilter.ts:9](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/processors/makeBoostOnAtlasSearchFilter.ts#L9)

___

### WithScore

Ƭ **WithScore**\<`T`\>: `T` & \{ `score`: `number`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:81

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

packages/mongodb-rag-core/build/CoreEnvVars.d.ts:1

___

### CUSTOM\_REQUEST\_ORIGIN\_HEADER

• `Const` **CUSTOM\_REQUEST\_ORIGIN\_HEADER**: ``"X-Request-Origin"``

#### Defined in

[packages/mongodb-chatbot-server/src/middleware/requireRequestOrigin.ts:4](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/middleware/requireRequestOrigin.ts#L4)

___

### DEFAULT\_API\_PREFIX

• `Const` **DEFAULT\_API\_PREFIX**: ``"/api/v1"``

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:108](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/app.ts#L108)

___

### DEFAULT\_MAX\_REQUEST\_TIMEOUT\_MS

• `Const` **DEFAULT\_MAX\_REQUEST\_TIMEOUT\_MS**: ``60000``

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:110](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/app.ts#L110)

___

### Reference

• **Reference**: `ZodObject`\<\{ `title`: `ZodString` ; `url`: `ZodString`  }, ``"strip"``, `ZodTypeAny`, \{ `title`: `string` ; `url`: `string`  }, \{ `title`: `string` ; `url`: `string`  }\>

#### Defined in

packages/mongodb-rag-core/build/services/conversations.d.ts:8

packages/mongodb-rag-core/build/services/conversations.d.ts:9

___

### References

• **References**: `ZodArray`\<`ZodObject`\<\{ `title`: `ZodString` ; `url`: `ZodString`  }, ``"strip"``, `ZodTypeAny`, \{ `title`: `string` ; `url`: `string`  }, \{ `title`: `string` ; `url`: `string`  }\>, ``"many"``\>

#### Defined in

packages/mongodb-rag-core/build/services/conversations.d.ts:19

packages/mongodb-rag-core/build/services/conversations.d.ts:20

___

### SomeExpressRequest

• `Const` **SomeExpressRequest**: `ZodObject`\<\{ `body`: `ZodOptional`\<`ZodObject`\<{}, ``"strip"``, `ZodTypeAny`, {}, {}\>\> ; `headers`: `ZodOptional`\<`ZodObject`\<{}, ``"strip"``, `ZodTypeAny`, {}, {}\>\> ; `params`: `ZodOptional`\<`ZodObject`\<{}, ``"strip"``, `ZodTypeAny`, {}, {}\>\> ; `query`: `ZodOptional`\<`ZodObject`\<{}, ``"strip"``, `ZodTypeAny`, {}, {}\>\>  }, ``"strip"``, `ZodTypeAny`, \{ `body?`: \{} ; `headers?`: \{} ; `params?`: \{} ; `query?`: \{}  }, \{ `body?`: \{} ; `headers?`: \{} ; `params?`: \{} ; `query?`: \{}  }\>

#### Defined in

[packages/mongodb-chatbot-server/src/middleware/validateRequestSchema.ts:6](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/middleware/validateRequestSchema.ts#L6)

___

### defaultConversationConstants

• `Const` **defaultConversationConstants**: [`ConversationConstants`](interfaces/ConversationConstants.md)

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:163](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L163)

___

### logger

• `Const` **logger**: `Logger`

#### Defined in

packages/mongodb-rag-core/build/services/logger.d.ts:13

___

### rateLimitResponse

• `Const` **rateLimitResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error` | `string` |

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:161](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L161)

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

packages/mongodb-rag-core/build/assertEnvVars.d.ts:1

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

packages/mongodb-rag-core/build/services/logger.d.ts:7

___

### createMessage

▸ **createMessage**(`messageParams`): \{ `content`: `string` ; `conversationId`: `ObjectId` ; `createdAt`: `Date` ; `customData?`: `Record`\<`string`, `unknown`\> ; `id`: `ObjectId` ; `role`: ``"system"``  } \| \{ `content`: `string` ; `conversationId`: `ObjectId` ; `createdAt`: `Date` ; `customData?`: `Record`\<`string`, `unknown`\> ; `embedding`: `number`[] ; `id`: `ObjectId` ; `preprocessedContent?`: `string` ; `rejectQuery?`: `boolean` ; `role`: ``"user"``  } \| \{ `content`: `string` ; `conversationId`: `ObjectId` ; `createdAt`: `Date` ; `customData?`: `Record`\<`string`, `unknown`\> ; `id`: `ObjectId` ; `rating?`: `boolean` ; `references`: \{ `title`: `string` ; `url`: `string`  }[] ; `role`: ``"assistant"``  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageParams` | [`AddConversationMessageParams`](modules.md#addconversationmessageparams) |

#### Returns

\{ `content`: `string` ; `conversationId`: `ObjectId` ; `createdAt`: `Date` ; `customData?`: `Record`\<`string`, `unknown`\> ; `id`: `ObjectId` ; `role`: ``"system"``  } \| \{ `content`: `string` ; `conversationId`: `ObjectId` ; `createdAt`: `Date` ; `customData?`: `Record`\<`string`, `unknown`\> ; `embedding`: `number`[] ; `id`: `ObjectId` ; `preprocessedContent?`: `string` ; `rejectQuery?`: `boolean` ; `role`: ``"user"``  } \| \{ `content`: `string` ; `conversationId`: `ObjectId` ; `createdAt`: `Date` ; `customData?`: `Record`\<`string`, `unknown`\> ; `id`: `ObjectId` ; `rating?`: `boolean` ; `references`: \{ `title`: `string` ; `url`: `string`  }[] ; `role`: ``"assistant"``  }

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:260](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L260)

___

### createMessageFromOpenAIChatMessage

▸ **createMessageFromOpenAIChatMessage**(`«destructured»`): [`SomeMessage`](modules.md#somemessage)

Create a [Message](modules.md#message) object from the [OpenAiChatMessage](interfaces/OpenAiChatMessage.md) object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`OpenAiChatMessage`](interfaces/OpenAiChatMessage.md) |

#### Returns

[`SomeMessage`](modules.md#somemessage)

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:278](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L278)

___

### errorHandler

▸ **errorHandler**(`err`, `req`, `res`, `next`): `void`

General error handler. Called at usage of `next()` in routes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `any` |
| `req` | `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\> |
| `res` | `Response`\<`any`, `Record`\<`string`, `any`\>, `number`\> |
| `next` | `NextFunction` |

#### Returns

`void`

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:73

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

packages/mongodb-rag-core/build/extractFrontMatter.d.ts:7

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

packages/mongodb-rag-core/build/arrayFilters.d.ts:8

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

packages/mongodb-rag-core/build/arrayFilters.d.ts:4

___

### makeApp

▸ **makeApp**(`config`): `Promise`\<`Express`\>

Constructor function to make the Express.js app.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`AppConfig`](interfaces/AppConfig.md) |

#### Returns

`Promise`\<`Express`\>

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:115](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/app.ts#L115)

___

### makeBoostOnAtlasSearchFilter

▸ **makeBoostOnAtlasSearchFilter**(`«destructured»`): [`SearchBooster`](interfaces/SearchBooster.md)

Boost certain results in search results from Atlas Search.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `MakeBoostOnAtlasSearchFilterArgs` |

#### Returns

[`SearchBooster`](interfaces/SearchBooster.md)

#### Defined in

[packages/mongodb-chatbot-server/src/processors/makeBoostOnAtlasSearchFilter.ts:37](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/processors/makeBoostOnAtlasSearchFilter.ts#L37)

___

### makeConversationsRouter

▸ **makeConversationsRouter**(`«destructured»`): `Router`

Constructor function to make the /conversations/* Express.js router.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ConversationsRouterParams`](interfaces/ConversationsRouterParams.md) |

#### Returns

`Router`

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:184](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L184)

___

### makeDataStreamer

▸ **makeDataStreamer**(): [`DataStreamer`](interfaces/DataStreamer.md)

Create a [DataStreamer](interfaces/DataStreamer.md) that streams data to the client.

#### Returns

[`DataStreamer`](interfaces/DataStreamer.md)

#### Defined in

[packages/mongodb-chatbot-server/src/services/dataStreamer.ts:95](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/dataStreamer.ts#L95)

___

### makeDefaultFindContentFunc

▸ **makeDefaultFindContentFunc**(`«destructured»`): [`FindContentFunc`](modules.md#findcontentfunc)

Basic implementation of FindContentFunc with search boosters.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`MakeDefaultFindContentFuncArgs`](modules.md#makedefaultfindcontentfuncargs) |

#### Returns

[`FindContentFunc`](modules.md#findcontentfunc)

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts:35](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/FindContentFunc.ts#L35)

___

### makeDefaultReferenceLinks

▸ **makeDefaultReferenceLinks**(`chunks`): \{ `title`: `string` ; `url`: `string`  }[]

The default reference format returns the following for chunks from _unique_ pages:

```js
{
  title: chunk.title ?? chunk.url, // if title doesn't exist, just put url
  url: chunk.url // this always exists
}
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `chunks` | [`EmbeddedContent`](interfaces/EmbeddedContent.md)[] |

#### Returns

\{ `title`: `string` ; `url`: `string`  }[]

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/addMessageToConversation.ts:482](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/conversations/addMessageToConversation.ts#L482)

___

### makeHandleTimeoutMiddleware

▸ **makeHandleTimeoutMiddleware**(`apiTimeout`): (`req`: `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\>, `res`: `Response`\<`any`, `Record`\<`string`, `any`\>\>, `next`: `NextFunction`) => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `apiTimeout` | `number` |

#### Returns

`fn`

▸ (`req`, `res`, `next`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\> |
| `res` | `Response`\<`any`, `Record`\<`string`, `any`\>\> |
| `next` | `NextFunction` |

##### Returns

`void`

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:93](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/app.ts#L93)

___

### makeMongoDbConversationsService

▸ **makeMongoDbConversationsService**(`database`, `systemPrompt`, `conversationConstants?`): [`ConversationsService`](interfaces/ConversationsService.md)

Create [ConversationsService](interfaces/ConversationsService.md) that uses MongoDB as a data store.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `database` | `Db` | `undefined` |
| `systemPrompt` | [`SystemPrompt`](modules.md#systemprompt) | `undefined` |
| `conversationConstants` | [`ConversationConstants`](interfaces/ConversationConstants.md) | `defaultConversationConstants` |

#### Returns

[`ConversationsService`](interfaces/ConversationsService.md)

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:176](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L176)

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

packages/mongodb-rag-core/build/MongoDbEmbeddedContentStore.d.ts:4

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

packages/mongodb-rag-core/build/MongoDbPageStore.d.ts:7

___

### makeOpenAiChatLlm

▸ **makeOpenAiChatLlm**(`«destructured»`): [`ChatLlm`](interfaces/ChatLlm.md)

Construct the [ChatLlm](interfaces/ChatLlm.md) service using the [OpenAI ChatGPT API](https://learn.microsoft.com/en-us/azure/ai-services/openai/chatgpt-quickstart?tabs=command-line&pivots=programming-language-studio).
The `ChatLlm` wraps the [@azure/openai](https://www.npmjs.com/package/@azure/openai) package.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`MakeOpenAiChatLlmParams`](interfaces/MakeOpenAiChatLlmParams.md) |

#### Returns

[`ChatLlm`](interfaces/ChatLlm.md)

#### Defined in

[packages/mongodb-chatbot-server/src/services/openAiChatLlm.ts:38](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/openAiChatLlm.ts#L38)

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

packages/mongodb-rag-core/build/OpenAiEmbedder.d.ts:22

___

### makeStaticSite

▸ **makeStaticSite**(`app`): `Express`

Middleware that serves the static site from the root path
(`GET https://my-site.com/`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `app` | `Express` |

#### Returns

`Express`

#### Defined in

[packages/mongodb-chatbot-server/src/routes/staticSite.ts:8](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/routes/staticSite.ts#L8)

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

packages/mongodb-rag-core/build/TypeChatJsonTranslateFunc.d.ts:29

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

packages/mongodb-rag-core/build/removeFrontMatter.d.ts:2

___

### reqHandler

▸ **reqHandler**(`req`, `res`, `next`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\> |
| `res` | `Response`\<`any`, `Record`\<`string`, `any`\>, `number`\> |
| `next` | `NextFunction` |

#### Returns

`void`

#### Defined in

node_modules/@types/express-serve-static-core/index.d.ts:60

___

### requireRequestOrigin

▸ **requireRequestOrigin**(): [`ConversationsMiddleware`](modules.md#conversationsmiddleware)

#### Returns

[`ConversationsMiddleware`](modules.md#conversationsmiddleware)

#### Defined in

[packages/mongodb-chatbot-server/src/middleware/requireRequestOrigin.ts:6](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/middleware/requireRequestOrigin.ts#L6)

___

### requireValidIpAddress

▸ **requireValidIpAddress**(): [`ConversationsMiddleware`](modules.md#conversationsmiddleware)

#### Returns

[`ConversationsMiddleware`](modules.md#conversationsmiddleware)

#### Defined in

[packages/mongodb-chatbot-server/src/middleware/requireValidIpAddress.ts:5](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/middleware/requireValidIpAddress.ts#L5)

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

packages/mongodb-rag-core/build/updateFrontMatter.d.ts:1
