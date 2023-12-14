# Include References

You can include references to the data sources that you use in your chatbot
in the response. This allows you to link to the original source of the information, and provide more context to the user.

These references are included in the `references` property of the response
from the [`POST /conversations/:conversationId/messages`](openapi#operation/createConversation).

## Format the References

Format the references in the response using a [`MakeReferenceLinksFunc`](../reference/server/modules.md#makereferencelinksfunc) function.

Include the `MakeReferenceLinksFunc` function in the [`ConversationsRouterParams.makeReferenceLinks`](../reference/server/interfaces/ConversationsRouterParams.md#makereferencelinks) property.

If you do not include a `MakeReferenceLinksFunc` function, the default [`makeDefaultReferenceLinksFunc()`](../reference/server/modules.md#makedefaultreferencelinksfunc) function is used. Its returns
the following data for chunks from _unique_ URLs.

```ts
{
  title: chunk.metadata.pageTitle ?? chunk.url, // if title doesn't exist, just put url
  url: chunk.url // this always exists
}
```
