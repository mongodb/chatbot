# Ingest MongoDB Public

This is the standard ingest config for public MongoDB documentation.

It also serves as an example of implementing a configuration/plugin for ingest.

## Building the Config

Be sure to build `chat-core` and `ingest` first.

```sh
npm i
npm run build
```

## Using the Config

Run `ingest`, passing the built js file to the `--config` flag.

```sh
node ./node_modules/ingest/build/main.js \
  <command> \
  --config build/config.js
```
