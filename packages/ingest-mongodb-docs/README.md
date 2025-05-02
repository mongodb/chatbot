# Ingest MongoDB Public Docs

This is the ingest config for public MongoDB documentation (https://www.mongodb.com/docs).


## Building the Config

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

