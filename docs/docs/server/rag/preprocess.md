# Pre-Process User Queries

One of the most powerful and flexible features that you can add to your chatbot
is a pre-processing step for user queries. With a query preprocessor,
you can mutate a query before it's used to [retrieve relevant content](./retrieve.md).
This makes the query more conversationally relevant,
and therefore more likely to get better results.

You can also use a preprocessor to reject queries that are inappropriate or
otherwise should not be sent to the chatbot.

Query preprocessors run on the `POST /conversations/:conversationId/messages` endpoint.

Adding a preprocessor is optional. If you don't add one, the user query is sent
directly to find relevant content and the query will never be rejected.

Generally, preprocessors use LLMs to perform the transformation.

For example, say a user sends the following message to a chatbot
that answers questions about the MongoDB documentation:

```txt
User: add data node
```

To make this query more relevant, you can add a preprocessor that transforms the
query to something like:

```txt
User: How do I add a data to MongoDB using the Node.js driver?
```

This transformed query is more likely to return relevant results,
which are then used to generate a better answer.

## The `Preprocessor` Function

Preprocessors have the [`QueryPreprocessorFunc`](../../reference/server/modules.md#querypreprocessorfunc) signature.

To run a preprocessor when adding user messages, include a `QueryPreprocessorFunc`
in the [`MakeRagGenerateUserPromptParams.queryPreprocessor`](../../reference/server/interfaces/MakeRagGenerateUserPromptParams.md#querypreprocessor) property.

## Mutate Queries

You can use a preprocessor to mutate the user query to make it more relevant.

If you don't want to mutate the query, do not return a `query` property from the
result or keep it the same as the original query.

Here's an example of preprocessor that transforms the user query
to a more semantically relevant question:

```ts
import {
  QueryPreprocessorFunc,
  makeRagGenerateUserPrompt,
} from "mongodb-chatbot-server";
import { AzureOpenAI } from "mongodb-rag-core/openai";

const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});
const querySystemPrompt: SystemPrompt = {
  role: "system",
  content: `Transform the query into a relevant question about MongoDB products or company.
Example 1:
User: add data node
Assistant: How do I add a data to MongoDB using the Node.js driver?
Example 2:
User: get started atlas
Assistant: How do I get started with MongoDB Atlas?`,
};

const queryToQuestionPreprocessor: QueryPreprocessorFunc = async function ({
  query,
  messages,
}) {
  if (query === undefined) {
    return { query, rejectQuery: false };
  }
  const {
    choices: [choice],
  } = await openAiClient.getChatCompletions(OPENAI_DEPLOYMENT, [
    querySystemPrompt,
    { role: "user", content: query },
  ]);
  const { message } = choice;
  return {
    query: message,
    rejectQuery: false,
  };
};

const ragGenerateUserPrompt = makeRagGenerateUserPrompt({
  queryPreprocessor: queryToQuestionPreprocessor,
  // ...other config
});
```

### Reject Queries

You can also add preprocessor logic to reject user queries that you do not want
to send to the chatbot. To reject a query, return `{ rejectQuery: true }` from the `QueryPreprocessorFunc`.

For example, say you want to reject queries that contain profanity.
You can use a preprocessor to check if the query contains profanity,
and reject the query if it does.

```ts
import { makeRagGenerateUserPrompt } from "mongodb-chatbot-server";
import { profanityCheck } from "./profanityCheck"; // checks if query contains profanity

async function rejectProfanePreprocessor({ query, messages }) {
  if (query === undefined) {
    return { query, rejectQuery: false };
  }
  const isProfane = await profanityCheck(query);
  return {
    rejectQuery: isProfane,
  };
}

const ragGenerateUserPrompt = makeRagGenerateUserPrompt({
  queryPreprocessor: rejectProfanePreprocessor,
  // ...other config
});
```
