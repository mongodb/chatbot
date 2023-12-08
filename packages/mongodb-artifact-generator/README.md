# MongoDB Artifact Generator

The artifact generator CLI helps content creators at MongoDB build faster
by using generative AI to create and translate content.

## Configuration

To configure the ingest tool, provide an `ingest.config.js` file. The default
export of this file must be a `Config` object. See [Config.ts](./src/Config.ts)
for details.

## Development

### Build & Run

Set up the project monorepo. Refer to the [Contributor Guide](../CONTRIBUTING.md)
for more info on monorepo setup.

Make sure you set up the `.env` files in both the `mongodb-rag-ingest` and `mongodb-rag-core` projects.

To use the ingest CLI locally, run:

```shell
# See all available commands
node .

# Run specific command
node . <command> <options>
```

A few things to keep in mind when developing in the `mongodb-rag-ingest` project:

1. You **must** recompile the `mongodb-rag-ingest` project with `npm run build` before running it
   from the CLI for changes to take effect. Therefore, when testing CLI commands locally,
   it can be convenient to run compilation and the command as a one-liner:

   ```shell
    npm run build && node . <command> <options>
   ```

2. You must also recompile `mongodb-rag-core` with `npm run build` every time you make
   changes to it for the changes to be accessible to `mongodb-rag-ingest` or any other projects that
   depend on it.

   ```shell
   cd ../mongodb-rag-core
   npm run build
   cd ../ingest
   # do stuff
   ```

### Add Commands

Add commands to `src/commands/`. The CLI automatically picks up any non-test .ts
file that default-exports a `yargs.CommandModule`. See existing commands for
example.
