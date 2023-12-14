---
id: "ConversationsRateLimitConfig"
title: "Interface: ConversationsRateLimitConfig"
sidebar_label: "ConversationsRateLimitConfig"
sidebar_position: 0
custom_edit_url: null
---

Configuration for rate limiting on the /conversations/* routes.

## Properties

### addMessageRateLimitConfig

• `Optional` **addMessageRateLimitConfig**: `Partial`\<`Options`\>

Configuration for rate limiting on the POST /conversations/:conversationId/messages route.
Since this is the most "expensive" route as it calls the LLM,
it could be more restrictive than the global rate limit.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:42](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L42)

___

### addMessageSlowDownConfig

• `Optional` **addMessageSlowDownConfig**: `Partial`\<`Options`\>

Configuration for slow down on the POST /conversations/:conversationId/messages route.
Since this is the most "expensive" route as it calls the LLM,
it could be more restrictive than the global slow down.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:54](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L54)

___

### routerRateLimitConfig

• `Optional` **routerRateLimitConfig**: `Partial`\<`Options`\>

Configuration for rate limiting on ALL /conversations/* routes.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:35](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L35)

___

### routerSlowDownConfig

• `Optional` **routerSlowDownConfig**: `Partial`\<`Options`\>

Configuration for slow down on ALL /conversations/* routes.

#### Defined in

[packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts:47](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-chatbot-server/src/routes/conversations/conversationsRouter.ts#L47)
