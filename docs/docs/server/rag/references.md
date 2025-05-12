# Include References

You can include references to the data sources that you use in your chatbot
in the response. This allows you to link to the original source of the information, and provide more context to the user.

These references are included in the `references` property of the response
from the [`POST /conversations/:conversationId/messages`](../openapi#operation/createConversation).

## Format References

Format the references in the response using a [`MakeReferenceLinksFunc`](../../reference/server/modules.md#makereferencelinksfunc) function.

To generate references, include a `MakeReferenceLinksFunc`
in the [`MakeRagGenerateUserPromptParams.makeReferenceLinks`](../../reference/server/interfaces/MakeRagGenerateUserPromptParams.md#makereferencelinks) property.

```ts
import { makeRagGenerateUserPrompt } from "mongodb-chatbot-server";
import { someMakeReferenceLinksFunc } from "./someMakeReferenceLinksFunc"; // example

const ragGenerateUserPrompt = makeRagGenerateUserPrompt({
  makeReferenceLinks: someMakeReferenceLinksFunc,
  // ...other config
});
```

The framework comes with the `MakeReferenceLinksFunc`, [`makeDefaultReferenceLinksFunc()`](../../reference/server/modules.md#makedefaultreferencelinksfunc). Its returns
the following data for chunks from _unique_ URLs.

```ts
{
  title: chunk.metadata.pageTitle ?? chunk.url, // if title doesn't exist, just put url
  url: chunk.url // this always exists
}
```

## Do Not Include References

To not include references, simply pass a function that returns an empty array.

```ts
import {
  MakeReferenceLinksFunc,
  makeRagGenerateUserPrompt,
} from "mongodb-chatbot-server";

const noReferencesFunc: MakeReferenceLinksFunc = () => [];

const ragGenerateUserPrompt = makeRagGenerateUserPrompt({
  makeReferenceLinks: noReferencesFunc,
  // ...other config
});
```
