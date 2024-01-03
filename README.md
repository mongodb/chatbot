# MongoDB Chatbot Framework

The MongoDB Chatbot Framework is a set of libraries that you can use to build
full-stack intelligent chatbot applications using MongoDB and [Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/).

You can use the MongoDB Chatbot Framework to create
retrieval augmented generation (RAG) applications.

## Documentation

To learn how to use the MongoDB Chatbot Framework, refer to the documentation:
<https://mongodb.github.io/chatbot/>.

## MongoDB Docs AI Chatbot Implementation

This repo also contains the implementation of the MongoDB Docs Chatbot,
which uses the MongoDB Chatbot Framework.

The MongoDB Docs Chatbot uses the MongoDB [documentation](https://www.mongodb.com/docs/) and [Developer Center](https://www.mongodb.com/developer/) as its sources of truth.

The chatbot builds on the following technologies:

- Atlas Vector Search: Indexes and queries content for use in project.
- MongoDB Atlas: Persists conversations and content.
- ChatGPT API: LLM to pre-process user queries and summarize responses to user queries.
- OpenAI Embeddings API: Create vector embeddings for user queries and content. Used by Atlas Vector Search.

To learn more about how we built the chatbot, check out the MongoDB Developer Center blog post
[Taking RAG to Production with the MongoDB Documentation AI Chatbot](https://www.mongodb.com/developer/products/atlas/taking-rag-to-production-documentation-ai-chatbot/).

## Contributing

To learn how to get started contributing to the project, refer to the [Contributor Guide](./CONTRIBUTING.md).

## License

This project is licensed under the [Apache 2.0 License](LICENSE).
