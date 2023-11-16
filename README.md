# MongoDB AI Chatbot

The AI Chatbot is a full-stack retrieval augmented generation (RAG) application.

The chatbot uses the MongoDB [documentation](https://www.mongodb.com/docs/) and [Developer Center](https://www.mongodb.com/developer/) as its sources of truth.

The chatbot builds on the following technologies:

- Atlas Vector Search: Indexes and queries content for use in project.
- MongoDB Atlas: Persists conversations and content.
- ChatGPT API: LLM to pre-process user queries and summarize responses to user queries.
- OpenAI Embeddings API: Create vector embeddings for user queries and content. Used by Atlas Vector Search.

To learn more about how we built the chatbot, checkout the the MongoDB Developer Center blog post
[Taking RAG to Production with the MongoDB Documentation AI Chatbot](https://www.mongodb.com/developer/products/atlas/taking-rag-to-production-documentation-ai-chatbot/).

## API Schema

[OpenAPI Schema of Chatbot API](./design-docs/openapi.yml)

## Contributing

To learn how to get started contributing to the project, refer to the [Contributor Guide](./CONTRIBUTING.md)

## License

This project is licensed under the [Apache 2.0 License](LICENSE).
