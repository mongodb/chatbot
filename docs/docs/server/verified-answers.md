# Verified Answers

The Chatbot Server can map incoming user queries to a collection of pre-written
"verified answers".

Verified answers are useful for:

- customizing the response to frequently asked questions
- avoiding expensive and time-consuming LLM calls to regenerate answers
- instilling user confidence that the response is accurate and doesn't contain hallucinations

## How It Works

Once you've [set up verified answers](#set-up-verified-answers), the server is
able to search for a verified answer that closely matches the user's provided
question.

For every incoming query, the server first tries to find a matching verified
answer. If it finds one, it immediately returns it as a response to the user
with a metadata flag that indicates it was verified. If the server does not find
a match, it falls back to the regular RAG flow.

## Data Model

You define verified answers alongside one or more prompts that they answer, a
list of reference links for the answer, and the verifier's email address.

Consider the following verified answer which can respond to multiple questions:

```yaml
questions:
  - Why did the chicken cross the road?
  - Why did the horse hop over the fence?
  - Why did the cow stroll through the meadow?
  - Why did the deer leap over the stream?
answer: >
  To get to the other side!

  For step-by-step instructions on how you can get to the other
  side, [read our tutorial](https://www.example.com/).
references:
  - url: https://example.com/jokes/why-did-x-cross-y
    title: Our 100 favorite "Why did the X cross the Y" Jokes
  - url: https://www.example.com/facts/chickens
    title: Everything you wanted to know about chickens, and then some!
author_email: somebody@example.com
```

This definition is split into multiple verified answer documents, one for each
entry in the `questions` array, and processed into a vector searchable format.
In MongoDB, the verified answer document generated from this definition
resembles the following:

```json
{
  "_id": "J28ut6WRRXDQuZ5LUCMUEWGSBf5xCt2oFWa19lD9QPA=",
  "question": {
    "embedding": [-0.00022248502, -0.005492599, 0.0006422517, /* ... */],
    "embedding_model": "text-embedding-ada-002",
    "embedding_model_version": "2023-06-01-preview",
    "text": "Why did the chicken cross the road?"
  },
  "answer": "To get to the other side!\n\nFor step-by-step instructions on how you can cross the road, [read our tutorial](https://www.example.com/).\n",
  "references": [
    {
      "url": "https://example.com/jokes/why-did-x-cross-y",
      "title": "Our 100 favorite \"Why did the X cross the Y\" Jokes"
    },
    {
      "url": "https://www.example.com/facts/chickens",
      "title": "Everything you wanted to know about chickens, and then some!"
    }
  ],
  "author_email": "somebody@example.com",
  "created": ISODate("2024-03-21T16:58:22.998Z"),
  "updated": ISODate("2024-03-21T17:33:58.277Z"),
  "hidden": null,
  "stillExistsInYaml": true
}
```

## Set Up Verified Answers {#set-up-verified-answers}

:::tip[Use MongoDB Atlas]
This guide assumes that you use MongoDB Atlas and Atlas Vector Search.
:::

### 1. Define Your Verified Answers

You define verified answers as a list of structured objects in a YAML file.

First, create the YAML file:

```sh
touch verified-answers.yaml
```

Then add one or more verified answers to the file:

```yaml title="verified-answers.yaml"
- questions:
    - Why did the chicken cross the road?
  answer: >
    To get to the other side!
  references:
    - url: https://example.com/
      title: Example Reference Link
  author_email: somebody@example.com
- questions:
    - Who created JavaScript?
    - When was JavaScript created?
  answer: >
    JavaScript was originally created by Brendan Eich in 1995
  references:
    - url: https://en.wikipedia.org/wiki/JavaScript
      title: JavaScript on Wikipedia
  author_email: somebody@example.com
```

### 2. Build and Link the Verified Answers CLI

The framework includes a CLI that can import your verified answers into MongoDB
in a searchable format. To use it, you must build the CLI from
source.

First, define a `.env` file with environment variables for the CLI. Make sure to
replace the placeholders with your app's values.

```text title="/packages/mongodb-chatbot-verified-answers/.env"
MONGODB_CONNECTION_URI=<connection_uri>  # A connection string for your MongoDB Atlas cluster
MONGODB_DATABASE_NAME=<docs-chatbot-ENV> # The database name for your chatbot
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
OPENAI_EMBEDDING_MODEL_VERSION=2023-03-15-preview
OPENAI_EMBEDDING_DEPLOYMENT=<deployment_name>
OPENAI_ENDPOINT=https://<resource_name>.openai.azure.com/
OPENAI_API_KEY=<api_key>
```

Then, run the following from the repo root:

```shell
npm run build
cd packages/mongodb-chatbot-verified-answers
npm link
```

You now have access to the `verified-answers` CLI in your shell.

:::note
You will need to build the CLI:

- the first time you use it
- to change an environment variables defined in the `.env` file
- to apply future feature updates
:::

### 3. Import Your Verified Answers

Use the `verified-answers` CLI to import your verified answers definition file.

```sh
verified-answers import path/to/verified-answers.yaml
```

The CLI intelligently diffs your definition file with any existing verified
answers in the database. Based on the diff, it applies changes to the data
without affecting unchanged data. For example it will:

- Add new documents for new verified answers
- Update existing documents for verified answers with new text or references
- Remove existing documents that don't match any answer defined in the provided file

### 4. Configure Atlas Vector Search

MongoDB Atlas Vector Search lets you find verified answers with questions
similar to the user's input. To use vector search, you must create a vector
search index on the verified answers collection. For detailed information on how
to set up a vector search index, refer to [Create Atlas Vector Search
Index](#create-vector-search-index) documentation.

The index specifies a field that contains a vector embedding to search. To match
the user's question against the verified answer's question, set the vector
search index `path` to `question.embedding` and set the `numDimensions` value to
match the length of your embedding model's vectors.

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

### 5. Configure Your Server

You set up verified answers in the server configuration file.

First, connect your app to the stored verified answers by implementing the
`VerifiedAnswerStore` interface. For most cases you can use the built-in
[`makeMongoDbVerifiedAnswerStore()`](../reference/core/modules/index.md#makemongodbverifiedanswerstore)
constructor.

Make sure to provide a connection string and the name of the database and
collection that contain the verified answer data.

```ts
const verifiedAnswerStore = makeMongoDbVerifiedAnswerStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  collectionName: "verified_answers",
});
```

Then, construct the function that searches the store for matching answers. For
most cases you can use the built-in `makeDefaultFindVerifiedAnswer()`
constructor.

```ts
export const findVerifiedAnswer = makeDefaultFindVerifiedAnswer({
  embedder,
  store: verifiedAnswerStore,
});
```

Finally, move your baseline `GenerateUserPromptFunc` to be the fallback
`onNoVerifiedAnswerFound` handler of the verified answer user prompt generator.

```ts
// The GenerateUserPromptFunc for your existing/standard RAG flow
export const generateRagUserPrompt = makeRagGenerateUserPrompt({
  findContent,
  queryPreprocessor: mongoDbUserQueryPreprocessor,
  makeReferenceLinks: makeMongoDbReferences,
  makeUserMessage,
});

// A new GenerateUserPrompt func that wraps your existing prompt and adds support for verified answers
export const generateUserPrompt = makeVerifiedAnswerGenerateUserPrompt({
  findVerifiedAnswer,
  // highlight-start
  onNoVerifiedAnswerFound: generateRagUserPrompt
  // highlight-end
});
```

At this point your chatbot is set up to serve verified answers.
