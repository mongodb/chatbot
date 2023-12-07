---
id: "ConversationsService"
title: "Interface: ConversationsService"
sidebar_label: "ConversationsService"
sidebar_position: 0
custom_edit_url: null
---

Service for managing [Conversation](Conversation.md)s.

## Properties

### addConversationMessage

• **addConversationMessage**: (`params`: [`AddConversationMessageParams`](../modules.md#addconversationmessageparams)) => `Promise`\<[`Message`](../modules.md#message)\>

#### Type declaration

▸ (`params`): `Promise`\<[`Message`](../modules.md#message)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`AddConversationMessageParams`](../modules.md#addconversationmessageparams) |

##### Returns

`Promise`\<[`Message`](../modules.md#message)\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:152](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L152)

___

### conversationConstants

• **conversationConstants**: [`ConversationConstants`](ConversationConstants.md)

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:150](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L150)

___

### create

• **create**: (`params?`: [`CreateConversationParams`](../modules.md#createconversationparams)) => `Promise`\<[`Conversation`](Conversation.md)\<[`ConversationCustomData`](../modules.md#conversationcustomdata)\>\>

#### Type declaration

▸ (`params?`): `Promise`\<[`Conversation`](Conversation.md)\<[`ConversationCustomData`](../modules.md#conversationcustomdata)\>\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`CreateConversationParams`](../modules.md#createconversationparams) |

##### Returns

`Promise`\<[`Conversation`](Conversation.md)\<[`ConversationCustomData`](../modules.md#conversationcustomdata)\>\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:151](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L151)

___

### findById

• **findById**: (`__namedParameters`: [`FindByIdParams`](FindByIdParams.md)) => `Promise`\<``null`` \| [`Conversation`](Conversation.md)\<[`ConversationCustomData`](../modules.md#conversationcustomdata)\>\>

#### Type declaration

▸ (`«destructured»`): `Promise`\<``null`` \| [`Conversation`](Conversation.md)\<[`ConversationCustomData`](../modules.md#conversationcustomdata)\>\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`FindByIdParams`](FindByIdParams.md) |

##### Returns

`Promise`\<``null`` \| [`Conversation`](Conversation.md)\<[`ConversationCustomData`](../modules.md#conversationcustomdata)\>\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:155](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L155)

___

### rateMessage

• **rateMessage**: (`__namedParameters`: [`RateMessageParams`](RateMessageParams.md)) => `Promise`\<`boolean`\>

#### Type declaration

▸ (`«destructured»`): `Promise`\<`boolean`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`RateMessageParams`](RateMessageParams.md) |

##### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:156](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L156)
