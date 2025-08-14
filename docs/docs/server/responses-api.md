# Responses API

The MongoDB Knowledge Service Responses API lets you get LLM-generated answers to MongoDB-related topics.

The Responses API includes the following features:

1. **Multi-Client Support:** The interface of the MongoDB Knowledge Service Responses API is a subset of the official [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses). This means you can call the MongoDB Responses API through any client that supports the OpenAI Responses API.

   To learn more, refer to the [Call the Responses API](#call-the-responses-api) section.

2. **Retrieval-Augmented Generation:** By default, the API performs retrieval-augmented generation under the hood to generate accurate and up-to-date responses about MongoDB products.

   To learn more, refer to the [Retrieval-Augmented Generation](#retrieval-augmented-generation) section.

3. **Personality:** The AI API has the personality of a helpful MongoDB assistant. You cannot change this core personality. You can augment the personality via custom instructions. (E.g. "You are a technical services engineer at MongoDB. Use that as context to inform your response.")

   To learn more about augmenting the personality, refer to [Set Custom Instructions](#set-custom-instructions).

4. **Custom Tools:** You can add custom function tools to the Responses API, allowing you to extend the functionality of the Responses API to support additional use cases.

   For more information, refer to the [Use Custom Tools](#use-custom-tools) section.

5. **Stateful and Stateless:** The API supports stateful and stateless conversation management. If you're using stateful conversation management, the conversation history is managed on the server. To use stateless conversation management, define the conversation context in each request from the client.

   For more information, refer to the [Conversation Management](#conversation-management) section.

6. **Guardrails:** The API features guardrails that helps ensure the input and output are appropriate for a MongoDB assistant. This protects the API from generating irrelevant or malicious responses.

   For more information, refer to the [Guardrails](#guardrails) section.

7. **Tracing & Storage:** All messages to the chatbot can be traced and stored or not depending on how you configure your request.

   For more information, refer to the [Tracing and Storage](#tracing-and-storage) section.

8. **Collect User Feedback:** You can rate and comment all messages from the Responses API. This is useful for tracking user feedback and API performance for your use case.

   For more information, refer to the [Collect User Feedback](#collect-user-feedback) section.

## API Specification

For a complete reference on the MongoDB Responses API, refer to the [OpenAPI specification](/openapi/#tag/Responses).
## Call the Responses API

As the MongoDB Knowledge Service Responses API uses the same interface as the OpenAI responses API, all clients that support the official OpenAI Responses API should also work for this API.

The Education AI team actively develops against the JavaScript Vercel AI SDK and the OpenAI client library.

Currently the Responses API only supports streaming using SSE. For all requests, you **must** set `stream: true`.

If you are new to working with LLM APIs, you can search the web for examples of using the official OpenAI Responses API. As our API uses a subset of the same specification, these examples should be broadly applicable as well. The [OpenAI Responses starter app](https://github.com/openai/openai-responses-starter-app) is a good complete application reference.

### OpenAI Client

Example usage with OpenAI client `openai`:

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });

const response = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "So what's MongoDB anyways??",
    },
  ],
});

for await (const event of response) {
  console.log(event);
}
```

### Vercel AI SDK

Example usage with [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) `@ai-sdk/openai` and `ai` libraries:

```ts
// NOTE: The Responses API currently only support streaming responses via methods like `streamText`. Methods that do not use streaming like `generateText` will not work.
import { streamText } from "ai";
// NOTE: we are using the AI SDK v5 with LanguageModelV2
import { createOpenAI } from "@ai-sdk/openai";

const model = createOpenAI({
  baseURL: origin + API_PREFIX,
  apiKey: TEST_OPENAI_API_KEY,
}).responses("mongodb-chat-latest");

const result = await streamText({
  model,
  prompt: "What is MongoDB?",
});

for await (const chunk of result.toUIMessageStream()) {
  console.log(chunk);
}
```

### `curl` Request

```sh
curl -v -X POST POST 'https://knowledge.mongodb.com/api/v1/responses' \
  -H 'Content-Type: application/json' \
  -H 'ORIGIN: mongodb.com' \
  -d '{
    "model": "mongodb-chat-latest",
    "stream": true,
    "input": "How do I create an index in MongoDB?",
  }'
```

## Retrieval-Augmented Generation

By default, the API performs retrieval-augmented generation under the hood
to generate accurate and up-to-date responses about MongoDB products.
Retrieval is managed by internal search tools.
These internal search tools cannot be removed from the API.

The API returns references to any sources used to generate the response in the `"response.output_text.annotation.added"` stream event. These stream events are only included if an internal search tool was called.

If you provide custom tools to the API via the `tools` parameter,
the API will choose to use the tool or the retrieval tool based on the `tool_choice` parameter.
Default behavior is to allow the model to choose the tool to use (`tool_choice: "auto"`).

```ts
const stream = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "So what's MongoDB anyways??",
    },
  ],
  // Uses RAG under the hood by default
});

for await (const event of stream) {
    switch(event.type) {
        // You stuff with the reference, like populate the UI.
        case "response.output_text.annotation.added":
            console.log(event);
            break;
        // ...other cases
    }
}
```

## Set Custom Instructions

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });

const response = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "So what's MongoDB anyways??",
    },
  ],
  // Custom instructions
  instructions: "You are located on the MongoDB Atlas cloud platform. Use that as context to inform your response."
});
```

## Use Custom Tools

You can add custom tools to the Responses API to make it produce structured output or agentically interact with services.

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });

//Custom tool definition
const tools =  [{
    type: "function",
    name: "test-tool",
    description: "A tool for testing.",
    parameters: {
        type: "object",
        properties: {
            query: { type: "string" },
        },
        required: ["query"],
    },
}];

const stream = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "So what's MongoDB anyways??",
    },
  ],
  // Pass tools array
  tools,
  // By default, the Responses API uses `tool_choice: "auto"`.
  // With this parameter, the model decides whether to call a tool
  // and which tool to call.
  // The model may chose to call one of the internal search tools
  // when using `tool_choice: "auto"`.
  // tool_choice: "auto"
});
```

### Force Tool Choice

You can force the Responses API to use a custom tool with the `tool_choice` parameter:

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });

const tools =  [{
  type: "function",
  name: "test-tool",
  description: "A tool for testing.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string" },
    },
    required: ["query"],
  },
}];

const stream = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "So what's MongoDB anyways??",
    },
  ],
  tools,
  // Force calling the tool
  tool_choice: {
    type: "function",
    name: tools[0].name,
  }
});
```

### Combine Custom Tools with Custom Instructions

You can use custom instructions to give the model additional context about how to use custom tools. To do this, use both the `instructions` and `tools` parameters on the request to the Responses API:

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });

const tools =  [{
  type: "function",
  name: "mongosh-query",
  description: "Write a Mongosh query",
  parameters: {
    type: "object",
    properties: {
      mongosh_query: { type: "string" },ta
    },
    required: ["query"],
  },
}];

const stream = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "how to aggregate data in movies collection?",
    },
  ],
  tools,
  // Instructions guiding tool usage
  instructions: `## ${tools[0].name} usage
  
If you use the '${tools[0].name}' tool,
always format the output as follows:
db.<collection-name>.<operation>(...args)

### Cursor-Returning Operations

For cursor-returning operations like .find() and .aggregate(),
postfix the query with the appropriate method
to convert it to the data from the database,
like .toArray() or .explain().
Ex: db.<collection-name>.<find|aggregate>(...args).toArray()

## Limiting Queries

Unless explicitly told otherwise by the user, limit queries to at most 10 documents.
Ex:
- { $limit: 10} for .aggregate()
- .limit(10) for .find()

...more instructions...`
});
```


## Conversation Management

The Responses API supports both stateful and stateless conversation management.

### Message Storage

The `store` parameter determines how the server persists conversations, and whether or not you can use stateful conversations.
By default if store `store: undefined`, the server stores conversations.
You can also explicitly set `store: true` for the same behavior.

If you set `store: false`, the database does not persist conversation messages, though it does persist non-sensitive metadata about the messages.

Only set `store: false` if your use case requires that the server does not persist conversation messages. For example, you should not store conversations if they contain sensitive customer data.

If your use case requires back-and-forth AND `store: true | undefined`, prefer using stateful conversations, as documented in the following section.

### Stateful Conversations

In stateful conversations, the server manages conversation history. You reference previous messages using the `previous_response_id` parameter, and the server maintains the context automatically.

By setting `previous_response_id`, all messages in conversation are stored together in the database. This makes conversations easier to analyze.

**Requirements for stateful conversations:**
1. Must set `store: true | undefined`
1. Must use the same `user` ID for all requests in the conversation
1. Maximum of 50 user messages per conversation
1. Each follow-up must reference the immediately previous response ID

If any of these requirements are violated, the server responds with an error.

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });
const userId = "user123";

// First message in conversation
const firstResponse = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: "What is MongoDB?",
  store: true, // Required for stateful conversations
  user: userId
});

let previousResponseId: string;
let conversationId: string;

for await (const event of firstResponse) {
  switch (event.type) {
    case "response.completed":
      previousResponseId = event.response.id;
      conversationId = event.response.metadata.conversation_id;
      break;
  }
}

// Follow-up message using previous_response_id
const followUpResponse = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: "How do I install it?",
  previous_response_id: previousResponseId, // Links to previous conversation
  store: true,
  user: userId // Must be the same user ID
});
```

### Stateless Conversations

In stateless conversations, you provide the entire conversation context in each request.

You can use stateless conversations for any storage setting,  `store: true | false | undefined`. 

If you set `store: false`, you **must** use a stateless conversation because the server doesn't maintain conversation history.

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });

const firstMessage = {
  type: "message",
  role: "user",
  content: "What is MongoDB?"
}
// First message
const firstResponse = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [firstMessage],
  store: false // Does not store conversation on server
});

// Get first response text to include in subsequent requests
let firstResponseOutputText = "";
for await (const event of firstResponse) {
  switch (event.type) {
    case "response.completed":
      firstResponseOutputText = event.response.output_text;
      break;
    default:
      continue;
  }
}

// Follow-up message with full conversation history
const followUpResponse = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    // Passing first message again because stateless conversation
    firstMessage,
    {
      type: "message",
      role: "assistant",
      content: firstResponseOutputText,
    },
    {
      type: "message",
      role: "user",
      content: "How do I install it?"
    }
  ],
  store: false
});
```

**Benefits of stateless conversations:**
- Works with `store: false` for privacy
- No user ID consistency requirements
- Full control over conversation context
- No 50 message limit (though total content must be ≤250,000 characters)

**Considerations:**
- More bandwidth usage (sending full context each time)
- Client responsible for managing conversation history
- Must manually track and include all relevant context

## Guardrails

The API features a few levels of guardrails to prevent use for irrelevant or malicious purposes. For security reasons, you cannot configure or turn the guardrails off.

Guardrails:

1. **Input guardrail**: Before generating a response, the server runs a separate LLM call to check that all natural language input is relevant and not malicious. The input guardrail checks the `input` messages, `instructions` system prompt, and custom `tools`.
1. **System prompt**: The system prompt used with all responses specifies that the model output should not speak negatively toward MongoDB and represent the company well.
1. **LLM content filter**: The LLM API used by the Responses API has guardrails to make sure that the model does not response to inappropriate or offensive content.

## Tracing and Storage

All messages to the Responses API are traced and stored in MongoDB if `store: true | undefined`.

If `store: false`, the Responses API only stores basic metadata.

For access to chatbot data, [contact the Education AI team](../contact.md).

All data retention is in line with MongoDB data retention policies.

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });

const stream = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "So what's MongoDB anyways??",
    },
  ],
  // Store conversation
  store: true
});
```

## Collect User Feedback

You can collect user feedback in the form of message ratings and comments on all generations from the Responses API. The Knowledge Service has separate endpoints for rating and commenting messages:

- [`rateMessage` endpoint](/openapi/#tag/Conversations/operation/rateMessage)
- [`commentMessage` endpoint](/openapi/#tag/Conversations/operation/commentMessage)

Usage example:

```ts
import { OpenAI } from "openai";

const knowledgeServiceBaseUrl = "https://knowledge.mongodb.com/api/v1";

const openai = new OpenAI({ baseURL: knowledgeServiceBaseUrl });

const stream = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "So what's MongoDB anyways??",
    },
  ],
});

let messageId: string;
let conversationId: string;

for await (const event of stream) {
  switch(event.type) {
    case "response.completed":
      // Extract the message ID and conversation ID for rating/commenting
      messageId = event.response.id;
      conversationId = event.response.metadata.conversation_id;
      break;
    // ...other event handling
  }
}

// Rate the message (thumbs up/down)
const rateResponse = await fetch(`${knowledgeServiceBaseUrl}/conversations/${conversationId}/messages/${messageId}/rating`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ORIGIN': 'your-domain.com'
  },
  body: JSON.stringify({
    rating: true // true for thumbs up, false for thumbs down
  })
});

// Add a comment to the message (requires the message to be rated first)
const commentResponse = await fetch(`${knowledgeServiceBaseUrl}/conversations/${conversationId}/messages/${messageId}/comment`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ORIGIN': 'your-domain.com'
  },
  body: JSON.stringify({
    comment: "This response was very helpful for understanding MongoDB Atlas setup."
  })
});
```