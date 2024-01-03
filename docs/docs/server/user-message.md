# Generate User Message

You can process a user's message before it is sent to the LLM to generate a response.
You can use this to perform retrieval augmented generation (RAG), or other preprocessing of the user message.

Generate the user message using a [`GenerateUserPromptFunc`](../reference/server/modules.md#generateuserpromptfunc) function.

If you do not use the `GenerateUserPromptFunc` function,
the user message is sent directly to the LLM.

Include the `GenerateUserPromptFunc` function in the [`ConversationsRouterParams.generateUserPrompt`](../reference/server/interfaces/ConversationsRouterParams.md#generateuserprompt) property.

```ts
import { AppConfig } from "mongodb-chatbot-server";
import { makeSomeGenerateUserPrompt } from "./generate-some-user-prompt";

const config: AppConfig = {
  // ...
  conversationsRouterParams: {
    // ...
    generateUserPrompt: makeSomeGenerateUserPrompt(),
  },
};
```

## Retrieval Augmented Generation (RAG)

To perform retrieval augmented generation (RAG) using a `GenerateUserMessageFunc`,
refer to the [RAG](./rag/index.md) guide.
