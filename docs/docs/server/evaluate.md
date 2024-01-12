# Evaluate Chatbot Responses

Evaluate the quality of your chatbot's responses

## Manual Evaluation

The simplest way to evaluate your chatbot's responses is to manually test it yourself.
You can do this with the MongoDB Chatbot Server by running the server locally and
querying it.

If you want to query it from a UI, you can quickly spin up the UI from the [Quick Start](../quick-start.md) guide.

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

You can also evaluate your chatbot's responses using a large language model.

The way that this works is you prompt the large language model to see
if the chatbot's generated message satisfies an expected answer.

For an example implementation of this, refer to the [`llmQualitativeTests`](https://github.com/mongodb/chatbot/tree/main/packages/chatbot-server-mongodb-public/src/llmQualitativeTests)
directory in the MongoDB Chatbot Server source code.
