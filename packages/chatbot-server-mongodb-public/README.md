# MongoDB AI Chatbot Server

This is an implementation of `mongodb-chatbot-server` that powers the MongoDB Education Chatbot. You can query the chatbot from https://mongodb.com/docs. 

The project uses an Express.js server.

## Usage

### Installation

This project is dependent on other packages in the monorepo, including `mongodb-rag-core` and `mongodb-chatbot-server`. To set up the monorepo, see the [Contributor Guide](../CONTRIBUTING.md).

### .env

Use the `.env.example` file to help configure a local `.env` file.

### Running

To start the development server, run:

```sh
npm run dev
```

By default, the server should be accessible through http://localhost:3000/.

### Testing

Tests are ran by [Jest](https://jestjs.io/) and rely on [Supertest](https://github.com/ladjs/supertest) for testing Express route logic.

To run tests, use:

```sh
npm run test
```

### Linting & Formatting

We use `eslint` for linting and `prettier` for formatting.

To lint the code and find any warnings or errors, run:

```sh
npm run lint
```

To format the code, run:

```sh
npm run format
```
 
