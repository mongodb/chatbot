# MongoDB AI Chatbot

Repo holding resources related to the MongoDB AI Chatbot. The AI Chatbot is a full-stack retrieval augmented generation (RAG) application.

The Chatbot uses the MongoDB [documentation](https://www.mongodb.com/docs/) and [Developer Center](https://www.mongodb.com/developer/) as its sources of truth.

The chatbot is build on top of the following technologies:

- Atlas Vector Search: Indexes and queries content for use in project.
- MongoDB Atlas: Persists conversations and content.
- ChatGPT API: LLM to pre-process user queries and summarize responses to user queries.
- OpenAI Embeddings API: Create vector embeddings for user queries and content. Used by Atlas Vector Search.

## Contributing

To learn how to get started contributing to the project, refer to the [Contributor Guide](./CONTRIBUTING.md)

## API Schema

[OpenAPI Schema of Chatbot API](./design-docs/openapi.yml)
