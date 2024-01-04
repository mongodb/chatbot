# MongoDB Artifact Generator

The artifact generator CLI helps content creators at MongoDB build faster
by using generative AI to create and translate content.

## Configuration

To configure the tool, define a `mongodb-artifact-generator.config.js` file. The default
export of this file must be a `Config` object. See [Config.ts](./src/Config.ts)
for details.

## Development

### Set Up

Set up the project monorepo. Refer to the [Contributor Guide](../CONTRIBUTING.md)
for more info on monorepo setup.

Make sure you define `.env` files in both the `mongodb-rag-core` and `mongodb-artifact-generator` projects.

### Build & Run

To use the CLI, you first have to build it:

```shell
npm run build
```

Then, you can run it directly:

```shell
# List all commands
node ./build/main.js
# Run a specific command
node ./build/main.js <command> <options>
```

A few things to keep in mind when developing in the `mongodb-artifact-generator` project:

1. You **must** recompile the `mongodb-artifact-generator` project with `npm run build` before running it
   from the CLI for changes to take effect. Therefore, when testing CLI commands locally,
   it can be convenient to run compilation and the command as a one-liner:

   ```shell
    npm run build && node . <command> <options>
   ```

   You can also use `tsc` in watch mode to automatically build whenever you change a source code file:

   ```shell
   # Start the compiler in watch mode
   npm run watch
   # In another shell - tsc will automatically update the built file so we can just call it
   node ./build/main.js <command> <options>
   ```

2. You must also recompile `mongodb-rag-core` with `npm run build` every time you make
   changes to it for the changes to be accessible to `mongodb-artifact-generator` or any other projects that
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
