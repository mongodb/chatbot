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

To perform retrieval augmented generation (RAG) using a `GenerateUserPromptFunc`,
refer to the [RAG](./rag/index.md) guide.

## Client Context

You can pass additional information from the user's client to the
`GenerateUserPromptFunc` function by setting the `clientContext` property in the
request body. This can include arbitrary data that might be useful for generating
a response. For example, this could include the user's location, the device they
are using, their preferred programming language, etc.

Any value provided in the `clientContext` property of the request body is
available in the `clientContext` property of the `GenerateUserPromptFunc`
function. You can use this information to customize the user prompt.

### Example

The following example shows how to use the `clientContext` property to customize
the user prompt.

```ts
const generateUserPrompt: GenerateUserPromptFunc = async ({
  userMessageText,
  clientContext,
}) => {
  return {
    userMessage: {
      role: "user",
      contentForLlm: `The user provided the following context:
currentLocation: ${clientContext.currentLocation}
preferredLanguage: ${clientContext.preferredLanguage}

${userMessageText}`,
    },
  }
};
```
