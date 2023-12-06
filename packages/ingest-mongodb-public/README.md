# Ingest MongoDB Public

This is the standard ingest config for public MongoDB documentation.

It also serves as an example of implementing a configuration/plugin for the `mongodb-rag-ingest` CLI.

## Building the Config

Be sure to build `mongodb-rag-core` and `mongodb-rag-ingest` first.

```sh
npm i
npm run build
```

## Using the Config

```sh
npm run ingest:all
```

This runs the ingest script with the `--config` flag passing
the built config file (`build/config.js`) to the tool.

