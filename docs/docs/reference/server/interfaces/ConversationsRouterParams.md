---
id: "ConversationsRouterParams"
title: "Interface: ConversationsRouterParams"
sidebar_label: "ConversationsRouterParams"
sidebar_position: 0
custom_edit_url: null
---

Configuration for the /conversations/* routes.

## Properties

### addMessageToConversationCustomData

• `Optional` **addMessageToConversationCustomData**: [`AddCustomDataFunc`](../modules.md#addcustomdatafunc)

Function that takes the request + response and returns any custom data you want to include
in the [Message](../modules.md#message) persisted to the database.
For example, you might want to store details about what LLM was used to generate the response.
The custom data is persisted to the database with the `Message` in the
Message.customData field inside of the [Conversation.messages](Conversation.md#messages) array.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:158](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L158)

___

### conversations

• **conversations**: [`ConversationsService`](ConversationsService.md)

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:99](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L99)

___

### createConversationCustomData

• `Optional` **createConversationCustomData**: [`AddCustomDataFunc`](../modules.md#addcustomdatafunc)

Function that takes the request + response and returns any custom data you want to include
in the [Conversation](Conversation.md) persisted to the database.
For example, you might want to store the user's email address with the conversation.
The custom data is persisted to the database with the Conversation in the
[Conversation.customData](Conversation.md#customdata) field.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:149](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L149)

___

### dataStreamer

• **dataStreamer**: [`DataStreamer`](DataStreamer.md)

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:98](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L98)

___

### findContent

• **findContent**: [`FindContentFunc`](../modules.md#findcontentfunc)

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:120](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L120)

___

### llm

• **llm**: [`ChatLlm`](ChatLlm.md)

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:97](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L97)

___

### makeReferenceLinks

• `Optional` **makeReferenceLinks**: [`MakeReferenceLinksFunc`](../modules.md#makereferencelinksfunc)

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:121](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L121)

___

### maxChunkContextTokens

• `Optional` **maxChunkContextTokens**: `number`

Maximum number of tokens of context to send to the LLM in retrieval augmented generation
in addition to system prompt, other user messages, etc.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:105](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L105)

___

### maxInputLengthCharacters

• `Optional` **maxInputLengthCharacters**: `number`

Maximum number of characters in user input.
Server returns 400 error if user input is longer than this.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:111](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L111)

___

### maxMessagesInConversation

• `Optional` **maxMessagesInConversation**: `number`

Maximum number of messages in a conversation.
Server returns 400 error if user tries to add a message to a conversation
that has this many messages.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:118](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L118)

___

### middleware

• `Optional` **middleware**: [`ConversationsMiddleware`](../modules.md#conversationsmiddleware)[]

Middleware to put in front of all the routes in the conversationsRouter.
You can use this to do things like authentication, data validation, etc.

If you want the middleware to run only on certain routes,
you can add conditional logic inside the middleware. For example:

```ts
const someMiddleware: ConversationsMiddleware = (req, res, next) => {
  if (req.path === "/conversations") {
    // Do something
  }
  next();
}
```

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:140](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L140)

___

### rateLimitConfig

• `Optional` **rateLimitConfig**: [`ConversationsRateLimitConfig`](ConversationsRateLimitConfig.md)

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:119](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L119)

___

### userQueryPreprocessor

• `Optional` **userQueryPreprocessor**: [`QueryPreprocessorFunc`](../modules.md#querypreprocessorfunc)

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:100](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L100)
