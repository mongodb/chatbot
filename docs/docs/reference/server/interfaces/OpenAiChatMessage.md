---
id: "OpenAiChatMessage"
title: "Interface: OpenAiChatMessage"
sidebar_label: "OpenAiChatMessage"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `ChatMessage`

  ↳ **`OpenAiChatMessage`**

## Properties

### content

• **content**: `string`

Response to user's chat message in the context of the conversation.

#### Overrides

ChatMessage.content

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:14](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L14)

___

### embedding

• `Optional` **embedding**: `number`[]

The vector representation of the content.

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:19](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L19)

___

### role

• **role**: [`OpenAiMessageRole`](../modules.md#openaimessagerole)

The role of the message in the context of the conversation.

#### Overrides

ChatMessage.role

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:12](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L12)
