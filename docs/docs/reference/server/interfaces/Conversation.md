---
id: "Conversation"
title: "Interface: Conversation<CustomData>"
sidebar_label: "Conversation"
sidebar_position: 0
custom_edit_url: null
---

Conversation between the user and the chatbot as stored in the database.

## Type parameters

| Name | Type |
| :------ | :------ |
| `CustomData` | extends [`ConversationCustomData`](../modules.md#conversationcustomdata) = [`ConversationCustomData`](../modules.md#conversationcustomdata) |

## Properties

### \_id

• **\_id**: `ObjectId`

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:84](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L84)

___

### createdAt

• **createdAt**: `Date`

The date the conversation was created.

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:88](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L88)

___

### customData

• `Optional` **customData**: `CustomData`

Custom data to include in the Conversation persisted to the database.
You can pass this data to the [()](ConversationsService.md#create) method.

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:96](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L96)

___

### messages

• **messages**: [`Message`](../modules.md#message)[]

Messages in the conversation.

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:86](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L86)

___

### requestOrigin

• `Optional` **requestOrigin**: `string`

The hostname that the request originated from.

#### Defined in

[packages/mongodb-chatbot-server/src/services/conversations.ts:90](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/conversations.ts#L90)
