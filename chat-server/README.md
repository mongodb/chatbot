# Docs Chatbot Server

Server that manages Q&A conversations for the Docs AI Chatbot.

## Setup

### Node

Node 18 was used to start this project. Please make sure you have Node 18 installed locally. If you have [nvm](https://github.com/nvm-sh/nvm), you can run `nvm use` to switch to the expected version of Node.

### Install

Use `npm` v8 to install dependencies:

```
npm install
```

### .env

Use the `.env.example` file to help configure a local `.env` file.

### External Dependencies

The server relies on some cloud-only services:

- The `content` service relies on Atlas Vector Search.
- The `llm` and `embeddings` services rely on the OpenAI APIs.

If this is your first time setting up the server, contact a member of the development
team for credentials.

## Running

To start the development server, run:

```
npm run dev
```

By default, the server should be accessible through http://localhost:3000/.

## Testing

Tests are ran by [Jest](https://jestjs.io/) and rely on [Supertest](https://github.com/ladjs/supertest) for testing Express route logic.

To run tests, use:

```
npm run test
```

## Linting

We use `eslint` for linting and `prettier` for formatting. `prettier` is configured to run on lint, so feel free to just use:

```
npm run lint
```

If there are errors flagged through `prettier`, use:

```
npm run format:fix
```

TRIgGER TEST!!!tsc!!!!!!!!
