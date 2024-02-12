# Chat with an LLM

This guide contains information on how you can use the MongoDB Chatbot Server
to chat with a large language model (LLM).

## Configure the `ChatLlm`

The [`ChatLlm`](../reference/server/interfaces/ChatLlm.md) is the interface
between the chatbot server and the LLM.

The MongoDB Chatbot Server comes with an implementation of the `ChatLlm`,
which uses the OpenAI API. You could also implement your own `ChatLlm` to
use a different language model or different configuration on the OpenAI API.

You can use the [`makeOpenAiChatLlm()`](../reference/server/modules.md#makeopenaichatllm)
constructor function to create an `OpenAiChatLlm` instance.

The following are useful things to keep in mind when using an LLM:

1. **What model to use.** This is probably the single most important decision
   for shaping the chatbot response. The quality and characteristics
   of different models vary greatly.
1. **Model temperature.** The temperature of the model determines how "creative"
   the model is. A higher temperature will result in more creative responses,
   but also more errors.
1. **Model max tokens.** The maximum number of tokens that the model will generate.
   This is useful for preventing the model from generating very long responses,
   which impacts cost and quality.
1. **Prompt engineering.** What additional information to include in the prompt
   to guide the model's behavior. For more information, refer to the
   [Prompt Engineering](#prompt-engineering) section.
1. **Tools.** What tools to give the model to use. For more information, refer to the
   [Tool Calling](./tools.md) guide.

The following is an example implementation of `makeOpenAiChatLlm()`:

```ts
import { makeOpenAiChatLlm, OpenAiChatMessage } from "mongodb-chatbot-server";
import { someTool } from "./someTool";
export const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);

export const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
  },
  tools: [someTool],
});
```

:::note[Both OpenAI API and Azure OpenAI Service Supported]

`makeOpenAiChatLlm()` supports both the OpenAI API and Azure OpenAI Service.
It wraps the `@azure/openai` package, which supports both of these services.

To use the `@azure/openai` package with the OpenAI API,
refer to [this documentation](https://www.npmjs.com/package/@azure/openai#using-an-api-key-from-openai).

:::

## Manage Previous Messages Sent to the LLM

The MongoDB Chatbot Server always sends the **current** user message to the LLM.

You can also manage which **previous** messages in a conversation the MongoDB Chatbot Server sends to the LLM on each user message.
You might want to do this to allow for appropriate context to be sent to the LLM
without exceeding the maximum number of tokens in the LLM's context window.

You do this at the `ConversationRouter` level with the [`ConversationsRouterParams.filterPreviousMessages`](../reference/server/interfaces/ConversationsRouterParams.md#filterpreviousmessages) property.
The `filterPreviousMessages` property accepts a [`FilterPreviousMessages`](../reference/server/modules.md#filterpreviousmessages) function.

By default, the MongoDB Chatbot Server only send the initial system prompt
and the user's current message to the LLM. You can change this behavior by
implementing your own `FilterPreviousMessages` function.

The MongoDB Chatbot Server package also comes with a [`makeFilterNPreviousMessages`](../reference/server/modules.md#makefilternpreviousmessages)
constructor function. `makeFilterNPreviousMessages`
creates a `FilterPreviousMessages` function that returns the previous `n` messages
plus the initial system prompt.

The following is an example implementation of `makeFilterNPreviousMessages()`:

```ts
import {
  makeFilterNPreviousMessages,
  ConversationsRouterParams,
  AppConfig,
} from "mongodb-chatbot-server";

const filter10PreviousMessages = makeFilterNPreviousMessages(10);

const conversationsRouterConfig: ConversationsRouterParams = {
  filterPreviousMessages: filter10PreviousMessages,
  ...otherConfig,
};
const appConfig: AppConfig = {
  conversationsRouterConfig,
  ...otherConfig,
};
```

## Prompt Engineering

Prompt engineering is the process of directing the output of a language model
to produce a desired response.

In the context of a chatbot server such as this, there are the following main areas
for prompt engineering:

- System prompt: Message at the beginning of the conversation that guides the
  chatbot's behavior when generating responses.
- User prompt: User message that the chatbot uses to generate a response.
  In RAG applications, this can include adding relevant content gathered from
  vector search results based on the user's input.

This guide does not cover prompt engineering techniques, but rather where you
can apply them in the MongoDB Chatbot Server.

Prompt engineering is a fairly new field, and best practices are still emerging.
A great resource to learn more about prompt engineering is the [Prompt Engineering Guide](https://www.promptingguide.ai/).

### System Prompt

To add a system prompt, include a [`SystemPrompt`](../reference/server/modules.md#systemprompt) message in your app's [`ConversationService`](../reference/server/interfaces/ConversationsService.md).

The system prompt is one of the most powerful way to customize the way
that the chatbot responds to users. You can use the system prompt to do things
such as:

- Control the style and personality of the chatbot.
- Determine how the chatbot responds to certain types of questions.
- Direct how the chatbot interprets user input and context information.

If you're using the [`makeMongoDbConversationsService()`](../reference/server/modules.md#makemongodbconversationsservice) constructor function, add the system prompt
as an argument:

```ts
import {
  makeMongoDbConversationsService,
  SystemPrompt,
} from "mongodb-chatbot-server";
import { MongoClient } from "mongodb";

// System prompt for chatbot
const systemPrompt: SystemPrompt = {
  role: "system",
  content: `You are an assistant to users of the MongoDB Chatbot Framework.
Answer their questions about the framework in a friendly conversational tone.
Format your answers in Markdown.
Be concise in your answers.
If you do not know the answer to the question based on the information provided,
respond: "I'm sorry, I don't know the answer to that question. Please try to rephrase it. Refer to the below information to see if it helps."`,
};

// Create MongoDB collection and service for storing user conversations
// with the chatbot.
const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME),
  systemPrompt
);
```

### User Prompt

You can modify what the chatbot uses as the user prompt by implementing the
[`GenerateUserPromptFunc`](../reference/server/modules.md#generateuserpromptfunc) function.

`GenerateUserPromptFunc` takes in the user's query and previous messages in the conversation, then returns a new user message. For an overview of the `GenerateUserPromptFunc` function, refer to the [Generate User Message](./user-message.md) guide.

You might want to modify the user prompt if you're using a prompting technique
like retrieval augmented generation (RAG) or chain of thought.
To learn more about using RAG with the MongoDB Chatbot Server, refer to the
[RAG](./rag/index.md) guide.
