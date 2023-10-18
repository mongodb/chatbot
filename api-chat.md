# API Chat

Chat with API using LLM + Atlas Vector Search.

For our Skunkworks, we'll work with the Atlas Admin API.

## TODOs

Stuff to do in project. As week goes on, we'll probably want to break this stuff down further.

- [ ] [INGEST] Ingest API spec files to `ApiEmbeddedContent` MongoDB collection
- [ ] [MONGODB] Set up Atlas Vector Search on `ApiEmbeddedContent` collection
- [ ] [UI] Make so can load API key, Atlas project and group before starting to chat
  - this'll make the flow work better.
  - send these with each req to server
- [ ] [INGEST] Clean up API spec so easy to consume
  - not sure if this should be part of the `pages` action, or we'll need to manually clean the spec
- [ ] [SERVER] When creating a conversation, make so can include the project and group
      in the DB.
  - api key should not be persisted in server. keep in client.
- [ ] [SERVER] add message to conversation for this functionality.
  - either respond with clarification questions for user or answer based on API call response.
  - will be similar logic to current `addMessageToConversation` route,
    but with added logic around API calls and using ChatGPT functions.

## Design

### Ingest

Very similar to chatbot.

```mermaid
graph TD
    ContentSource[Content Sources: API spec file] -->|1. Fetch spec via Content Interface| IngestService[Ingestion Service]
    IngestService --> |2. store spec in MongoDB | PagesCollection[Pages MongoDB collection]
    IngestService -->|3. Break spec up into chunks| IngestService
    IngestService -->|4. generate vector embeddings| OpenAI[Embedding API]
    IngestService -->|5. Store chunks in MongoDB| EmbeddedContent[EmbeddedContentCollection]
    EmbeddedContent <-->|6. Atlas Vector Search indexes embeddings| AtlasVectorSearch
```

### Chat

Similar idea to current docs chatbot, but using ChatGPT functions to load and execute actions.
Uses Atlas Vector Search to find relevant actions.

```mermaid
flowchart TD
    User-->|1. query| Chatbot
    Chatbot -->|2. Select action| EmbeddedContent[Vector store with embedded content]
    EmbeddedContent -->|3. Add API action to chatbot| Chatbot
    Chatbot <-->|4. Chat to get necessary data\n to execute action| User
    Chatbot -->|5. Call API to execute action | API
    Chatbot -->|6. Respond with action results| User
```
