---
id: "SearchBooster"
title: "Interface: SearchBooster"
sidebar_label: "SearchBooster"
sidebar_position: 0
custom_edit_url: null
---

Modify the vector search results to add, elevate, or mutate search results
after the search has been performed.

## Properties

### boost

• **boost**: (`__namedParameters`: \{ `embedding`: `number`[] ; `existingResults`: [`WithScore`](../modules.md#withscore)\<[`EmbeddedContent`](EmbeddedContent.md)\>[] ; `store`: [`EmbeddedContentStore`](../modules.md#embeddedcontentstore)  }) => `Promise`\<[`WithScore`](../modules.md#withscore)\<[`EmbeddedContent`](EmbeddedContent.md)\>[]\>

#### Type declaration

▸ (`«destructured»`): `Promise`\<[`WithScore`](../modules.md#withscore)\<[`EmbeddedContent`](EmbeddedContent.md)\>[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `embedding` | `number`[] |
| › `existingResults` | [`WithScore`](../modules.md#withscore)\<[`EmbeddedContent`](EmbeddedContent.md)\>[] |
| › `store` | [`EmbeddedContentStore`](../modules.md#embeddedcontentstore) |

##### Returns

`Promise`\<[`WithScore`](../modules.md#withscore)\<[`EmbeddedContent`](EmbeddedContent.md)\>[]\>

#### Defined in

[packages/mongodb-chatbot-server/src/processors/SearchBooster.ts:13](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-chatbot-server/src/processors/SearchBooster.ts#L13)

___

### shouldBoost

• **shouldBoost**: (`__namedParameters`: \{ `text`: `string`  }) => `Promise`\<`boolean`\>

#### Type declaration

▸ (`«destructured»`): `Promise`\<`boolean`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `text` | `string` |

##### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/mongodb-chatbot-server/src/processors/SearchBooster.ts:12](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-chatbot-server/src/processors/SearchBooster.ts#L12)
