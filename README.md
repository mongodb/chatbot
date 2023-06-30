# MongoDB Documentation AI Chatbot

Repo holding resources related to the MongoDB AI Chatbot. The Chatbot uses the MongoDB [documentation](https://www.mongodb.com/docs/) and [Developer Center](https://www.mongodb.com/developer/) as its sources of truth.

More coming soon!

## Search Index Configuration

```json
{
  "mappings": {
    "fields": {
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
```
