---
id: "AppConfig"
title: "Interface: AppConfig"
sidebar_label: "AppConfig"
sidebar_position: 0
custom_edit_url: null
---

Configuration for the server Express.js app.

## Properties

### apiPrefix

• `Optional` **apiPrefix**: `string`

Prefix for all API routes. Defaults to `/api/v1`.

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:45](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/app.ts#L45)

___

### conversationsRouterConfig

• **conversationsRouterConfig**: [`ConversationsRouterParams`](ConversationsRouterParams.md)

Configuration for the conversations router.

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:29](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/app.ts#L29)

___

### corsOptions

• `Optional` **corsOptions**: `CorsOptions`

Configuration for CORS middleware. Defaults to allowing all origins.

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:40](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/app.ts#L40)

___

### maxRequestTimeoutMs

• `Optional` **maxRequestTimeoutMs**: `number`

Maximum time in milliseconds for a request to complete before timing out.
Defaults to 60000 (1 minute).

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:35](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/app.ts#L35)

___

### serveStaticSite

• `Optional` **serveStaticSite**: `boolean`

Whether to serve a static site from the root path (`GET https://my-site.com/`).
Defaults to false.
This is useful for demo and testing purposes.

You should probably not include this in your production server.
You can control including this in dev/test/staging but not production
with an environment variable.

#### Defined in

[packages/mongodb-chatbot-server/src/app.ts:56](https://github.com/mongodben/chatbot/blob/2994a88/packages/mongodb-chatbot-server/src/app.ts#L56)
