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

The following is an example implementation of `makeOpenAiChatLlm()`:

```ts
import {
  makeOpenAiChatLlm,
  OpenAiChatMessage,
  SystemPrompt,
} from "mongodb-chatbot-server";

export const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);
export const systemPrompt: SystemPrompt = {
  role: "system",
  content: stripIndents`You are expert MongoDB documentation chatbot.
You enthusiastically answer user questions about MongoDB products and services.
Your personality is friendly and helpful, like a professor or tech lead.
You were created by MongoDB but they do not guarantee the correctness
of your answers or offer support for you.
Use the context provided with each question as your primary source of truth.
NEVER lie or improvise incorrect answers.
If you do not know the answer to the question, respond ONLY with the following text:
"I'm sorry, I do not know how to answer that question. Please try to rephrase your query. You can also refer to the further reading to see if it helps."
NEVER include links in your answer.
Format your responses using Markdown.
DO NOT mention that your response is formatted in Markdown.
If you include code snippets, make sure to use proper syntax, line spacing, and indentation.
ONLY use code snippets present in the information given to you.
NEVER create a code snippet that is not present in the information given to you.
You ONLY know about the current version of MongoDB products. Versions are provided in the information. If \`version: null\`, then say that the product is unversioned.
Never mention "<Information>" or "<Question>" in your answer.
Refer to the information given to you as "my knowledge".`,
};

export async function generateUserPrompt({
  question,
  chunks,
}: {
  question: string;
  chunks: string[];
}): Promise<OpenAiChatMessage & { role: "user" }> {
  const chunkSeparator = "~~~~~~";
  const context = chunks.join(`\n${chunkSeparator}\n`);
  const content = `Using the following information, answer the question.
Different pieces of information are separated by "${chunkSeparator}".

<Information>
${context}
<End information>

<Question>
${question}
<End Question>`;
  return { role: "user", content };
}

export const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  systemPrompt,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
  },
  generateUserPrompt,
});
```

:::note[Both OpenAI API and Azure OpenAI Service Supported]

The MongoDB Chatbot Server supports both the OpenAI API and Azure OpenAI Service.
It uses the `@azure/openai` package, which supports both of these services.

To use the `@azure/openai` package with the OpenAI API,
refer to [this documentation](https://www.npmjs.com/package/@azure/openai#using-an-api-key-from-openai).

:::

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

To add a system prompt, include a [`SystemPrompt`](../reference/server/modules.md#systemprompt) message in your app's [`ChatLlm`](../reference/server/interfaces/ChatLlm.md).

The system prompt is one of the most powerful way to customize the way
that the chatbot responds to users. You can use the system prompt to do things
such as:

- Control the style and personality of the chatbot.
- Determine how the chatbot responds to certain types of questions.
- Direct how the chatbot interprets user input and context information.

If you're using the [`makeOpenAiChatLlm()`](../reference/server/modules.md#makeopenaichatllm) constructor function, add the system prompt to the `systemPrompt` property:

```ts
import { makeOpenAiChatLlm, SystemPrompt } from "mongodb-chatbot-server";

export const systemPrompt: SystemPrompt = {
  role: "system",
  content: "You are expert chatbot...",
};

export const llm = makeOpenAiChatLlm({
  systemPrompt,
  ...otherConfig,
});
```

### User Prompt

You can modify what the chatbot uses as the user prompt by implementing the
[`GenerateUserPromptFunc`](../reference/server/modules.md#generateuserpromptfunc) function.

`GenerateUserPromptFunc` takes in the user's query and previous messages in the conversation, then returns a new user message. For an overview of the `GenerateUserPromptFunc` function, refer to the [Generate User Message](./user-message.md) guide.

You might want to modify the user prompt if you're using a prompting technique
like retrieval augmented generation (RAG) or chain of thought.
To learn more about using RAG with the MongoDB Chatbot Server, refer to the
[RAG](./rag/index.md) guide.
