# Evaluate Chatbot Responses

Evaluate the quality of your chatbot's responses

## Manual Evaluation

The simplest way to evaluate your chatbot's responses is to manually test it yourself.
You can do this with the MongoDB Chatbot Server by running the server locally and
querying it.

If you want to query it from a UI, you have the following options:

- Spin up the UI from the [Quick Start](../quick-start.md) guide.
- Build your own UI with the [Chatbot UI](../ui.md) components.
- Build a custom UI that queries the server directly. Refer to the [API specification](./openapi) for more information on the endpoints.

:::note[Query Server Directly]

You could also query the server directly using HTTP clients like [`curl`](https://curl.se/) or [Postman](https://www.postman.com/).

:::

## Red Teaming

You can evaluate your chatbot's responses by having a team of people "red team" it.
In a chatbot red teaming exercise, a team of people will ask a variety of questions
to the chatbot, evaluating response quality and identifying areas for improvement.

To learn more about how you can red team a chatbot, refer to the
[documentation from Microsoft](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/red-teaming).

## Automated Evaluation

You can evaluate your chatbot's responses using a variety of automated methods and tools.

On the team that builds the MongoDB Chatbot Framework, we use [Braintrust](braintrust.dev) as our automated evaluation tool.
You can search in the project's repository for `**.eval.ts` files to see how we use Braintrust for evaluation.

:::note[Deprecated Evaluation CLI]

The MongoDB Chatbot Framework used to have an evaluation CLI that you could use to evaluate your chatbot's responses.

We have deprecated this CLI in favor of using Braintrust for evaluation.

:::
