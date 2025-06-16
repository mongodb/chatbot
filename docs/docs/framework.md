# MongoDB Chatbot Framework (deprecated)

The team building the MongoDB Knowledge Service previous developed the MongoDB Chatbot Framework. This consisted of the npm packages:

- `mongodb-chatbot-server`
- `mongodb-chatbot-ui` (still used, refer to [UI](./ui.md))
- `mongodb-rag-core`
- `mongodb-rag-ingest`

The MongoDB Chatbot Framework in now deprecated. We will no longer be maintaining it.

To learn more about the framework, refer to the the blog post [Build a Production-Ready, Intelligent Chatbot With the MongoDB Chatbot Framework](https://dev.to/mongodb/build-a-production-ready-intelligent-chatbot-with-the-mongodb-chatbot-framework-4dd).

## Why Deprecate the MongoDB Chatbot Framework?

Since we first launched the framework a year and a half ago, there's been a lot of progress in the TypeScript ecosystem for AI frameworks. We have decided that these frameworks remove the need for the MongoDB Chatbot Framework. Additionally, supporting the framework in addition to the Knowledge Service has been a maintenance burden on our small team.

In particular, we've been very impressed by the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction). It has a great developer experience, is well maintained, and a robust feature set. We've moved most of our LLM call logic to the AI SDK. You can refer to our [mongodb/chatbot repository](https://github.com/mongodb/chatbot) to see how we're using it. For a tutorial on building with MongoDB Atlas and the AI SDK, refer to the blog post [Building a Chat Application That Doesn't Forget!](https://dev.to/mongodb/building-a-chat-application-with-mongodb-memory-provider-for-vercel-ai-sdk-56ap) by MongoDB's own Jesse Hall.

For building more agentic applications in TypeScript, [Mastra](https://mastra.ai/en/docs) (itself built on the AI SDK), [LangGraph.js](https://langchain-ai.github.io/langgraphjs/), and the [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/) all seem to be solid options. 
