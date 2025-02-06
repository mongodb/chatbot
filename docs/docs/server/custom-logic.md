# Customize Server Logic

The MongoDB Chatbot Server provides a few ways to customize the server to meet
the needs of your application.

## App-Level Configuration

You can add custom Express.js routes and application-level logic by including the [`AppConfig.expressAppConfig`](../reference/server/interfaces/AppConfig.md#expressappconfig) function in your app configuration.
Pass the `AppConfig` object to the [`makeApp`](../reference/server/modules.md#makeapp) function to create the app.

```typescript
import { makeApp, AppConfig } from "mongodb-chatbot-server";

const appConfig: AppConfig = {
  // ...other config
  expressAppConfig: (app) => {
      app.get("/", (req, res) => res.send({ hello: "world" }))
  },
};

const app = await makeApp(appConfig);
//...
```

## Middleware

You can configure the server to run custom middleware, [`ConversationsMiddleware`](../reference/server/modules.md#conversationsmiddleware).
The `ConversationsMiddleware` include a custom [`Response.locals`](https://expressjs.com/en/api.html#res.locals) object
that you can use to access the app's [`ConversationsService`](../reference/core/interfaces/Conversations.ConversationsService.md) with the `conversationsService` property
and a `customData` object, where you can store arbitrary data.

Add multiple middleware to the server via the [`ConversationRouterParams.middleware`](../reference/server/interfaces/ConversationsRouterParams.md#middleware)

Here's a basic middleware and how you can add it to the server.

```typescript
import { ConversationsMiddleware, AppConfig } from "mongodb-chatbot-server";

const someMiddleware: ConversationsMiddleware = async (req, res, next) => {
  try {
    const conversation = await res.locals.conversations.findById(
      req.params.conversationId
    );
    // ...do something with the conversation

    // Add custom data to the response
    res.locals.customData = {
      foo: "bar",
    };
  } catch (err) {
    next(err);
  } finally {
    next();
  }
};

const appConfig: AppConfig = {
  // ...other config
  conversationsRouterParams: {
    middleware: [someMiddleware],
    // ...other config
  },
};
// ...create app
```

### Request Validation

You can use custom middleware to validate the request before it's processed
by the `/conversations` routes.

```typescript
import { ConversationsMiddleware } from "mongodb-chatbot-server";

const requireUserId: ConversationsMiddleware = async (req, res, next) => {
  const userId = req.headers.userId;
  if (!userId) {
    return res.status(400).json({
      error: "Missing userId header",
    });
  }
  next();
};
```

### Include Custom Data to be Processed by the Server

You can also use the middleware to modify the request or response objects.
For example, you could store additional data in the `Response.locals` object or
perform user authentication.

```typescript
import { ConversationsMiddleware } from "mongodb-chatbot-server";
import { authenticateUser } from "./auth"; // Some authentication function

const authenticateUser: ConversationsMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authToken;
    if (!token) {
      return res.status(400).json({
        error: "Missing authToken header",
      });
    }
    // Authenticate user
    const user = await authenticateUser(token);
    if (!user) {
      return res.status(401).json({
        error: "Invalid authToken",
      });
    }
    // Add authenticated user data to the response
    res.locals.customData = {
      user,
    };
    next();
  } catch (err) {
    next(err);
  }
};
```

### Included Middleware

The MongoDB Chatbot Server includes the following middleware.

- [`requireRequestOrigin()`](../reference/server/modules.md#requirerequestorigin): Requires that the request
  includes a `X-Request-Origin` or `origin` header. Enabled by default.
- [`requireValidIpAddress()`](../reference/server/modules.md#requirevalidipaddress): Requires that the request
  includes a `X-Forwarded-For` header with a valid IP address. Enabled by default.

## Add Custom Data

You can add custom data to the persisted conversation or to individual messages.

### `AddCustomDataFunc`

Add custom data using a [`AddCustomDataFunc`](../reference/server/modules.md#addcustomdatafunc) function.

The function accepts the Express `Request` and `Response`. The `Response` includes
the `ConversationsRouterLocals` in the `Response.locals` property.
The function returns a `Promise` that resolves to a [`ConversationCustomData`](../reference/server/modules.md#conversationcustomdata) object.

```typescript
import { AddCustomDataFunc } from "mongodb-chatbot-server";

const addOriginAndIpToCustomData: AddCustomDataFunc = async (req, res) =>
  res.locals.customData.origin
    ? { origin: res.locals.customData.origin, ip: req.ip }
    : undefined;
```

### Add Custom Data to Conversation

You can add custom data to the [`Conversation.customData`](../reference/core/interfaces/Conversations.Conversation.md#customdata)
property persisted in the database.

To add custom data to the conversation, set the [`ConversationsRouterParams.createConversationCustomData`](../reference/server/interfaces/ConversationsRouterParams.md#createConversationCustomData)
to a `CustomDataFunc`. This function is run when you create a conversation
with the `POST /conversations` endpoint.

```typescript
import { AddCustomData, AppConfig } from "mongodb-chatbot-server";

const addOriginAndIpToCustomData: AddCustomDataFunc = async (req, res) =>
  res.locals.customData.origin
    ? { origin: res.locals.customData.origin, ip: req.ip }
    : undefined;

const appConfig: AppConfig = {
  // ...other config
  conversationsRouterParams: {
    createConversationCustomData: addOriginAndIpToCustomData,
    // ...other config
  },
};
// ...create app
```

This creates a `Conversation` in the database with the following schema:

```typescript
{
  _id: ObjectId("Some ObjectId"),
  messages: [ /*...*/ ],
  createdAt: Date("Some Date"),
  customData: {
    origin: "https://example.com";
    ip: "192.158.1.38";
  }
}
```

### Add Custom Data to Messages

You can add custom data to the [`Conversation.messages[].customData`](../reference/core/interfaces/Conversations.Conversation.md#messages)
property persisted in the database.

To add custom data to the conversation, set the [`ConversationsRouterParams.addMessageToConversationCustomData`](../reference/server/interfaces/ConversationsRouterParams.md#addMessageToConversationCustomData)
to a `CustomDataFunc`. This function is run when you create a conversation
with the `POST /conversations/:conversationId/messages` endpoint.

```typescript
import { AddCustomData, AppConfig } from "mongodb-chatbot-server";

const addOriginAndIpToCustomData: AddCustomDataFunc = async (req, res) =>
  res.locals.customData.origin
    ? { origin: res.locals.customData.origin, ip: req.ip }
    : undefined;

const appConfig: AppConfig = {
  // ...other config
  conversationsRouterParams: {
    addMessageToConversationCustomData: addOriginAndIpToCustomData,
    // ...other config
  },
};
// ...create app
```

This creates a `Conversation` in the database with the following schema:

```typescript
{
  _id: ObjectId("Some ObjectId"),
  createdAt: Date("Some Date"),
  messages: [ /*...other messages*/,
    {
      _id: ObjectId("Some ObjectId"),
      role: "user",
      content: "Some message",
      createdAt: Date("Some Date"),
      customData: {
        origin: "https://example.com",
        ip: "192.158.1.38",
      }
    },
    {/*...assistant message*/}],
}
```

### Included Custom Data Functions

By default, the MongoDB Chatbot Server includes custom data functions that add
the following custom data:

- `Conversation.customData`: `origin` and `ip` from the request.
- For all user messages, `Message.customData`: `origin` and from the request.
