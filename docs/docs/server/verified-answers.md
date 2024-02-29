# Verified Answers

"Verified answers" is a feature of the chatbot server that allows the chatbot to
return pre-written answers for a given question.

## `VerifiedAnswerStore`

The `VerifiedAnswerStore` is an interface to the stored verified answers in your app.

To create a `VerifiedAnswerStore` that stores data in MongoDB, you can use the
function
[`makeMongoDbVerifiedAnswerStore()`](../reference/core/modules.md#makemongodbverifiedanswerstore).
This function returns a `VerifiedAnswerStore` that reads data in the
`verified_answers` collection in MongoDB.

## Configure Atlas Vector Search Index

To use the `VerifiedAnswerStore` returned by `makeMongoDbVerifiedAnswerStore()` in your RAG app,
you must set up Atlas Vector Search on the `verified_answers` collection in MongoDB.
For more information on setting up the vector search index on the `verified_answers` collection,
refer to the [Create Atlas Vector Search Index](../mongodb.md#3-create-atlas-vector-search-index)
documentation.

The embedding field of the verified answer object is `question.embedding`. Your
vector search index on the `verified_answers` collection should look something like this:

```js
{
  "fields": [
    {
      "numDimensions": "<embedding length, e.g. 1536>",
      "path": "question.embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```
