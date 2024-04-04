# MongoDB Artifact Generator

The artifact generator CLI helps content creators at MongoDB build faster
by using generative AI to create and translate content.

## Set Up

To use this tool, you must set up the project monorepo. Refer to the
[Contributor Guide](/CONTRIBUTING.md) for more info on monorepo setup.

Make sure you define `.env` files in both the `mongodb-rag-core` and `mongodb-artifact-generator` projects.

## Build & Run

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

You can also link the CLI binary to use `mongodb-ai` in your shell instead of
invoking the build code directly:

```shell
# Link the local package
npm link
# List all commands
mongodb-ai
# Run a specific command
mongodb-ai <command> <options>
```

### Configuration

The tool uses a configuration file to determine where to find embedded content,
how to embed content, and other interfaces.

**For most use cases, you can use the built-in standard configuration file:** [`standardConfig`](/packages/mongodb-artifact-generator/src/standardConfig.ts).

To use a custom configuration, define a new configuration file. The default
export of this file must be a `Config` object. See [Config.ts](./src/Config.ts)
for details.

## Usage Examples

### Generate a Docs Page

You can generate a docs page that matches a specific template and description.

For a full list of templates, see the [TDBX Content Types](./context/tdbx-content-types) in the `context` folder.

```shell
mongodb-ai generateDocsPage \
  --template="quick-start" \
  --targetDescription="A guide for brand new programmers on how to get started with MongoDB Atlas. It should include some motivating information and focus on getting the user to an 'aha moment'."
```

### Translate a Code Example

You can translate a code example from one programming language/framework to another.

```shell
mongodb-ai translateCode \
  --source="./code-examples/insertOne.js" \
  --targetDescription="Rewrite this using Java and the MongoDB Java Reactive Streams Driver." \
  --targetFileExtension="java" \
  --outputPath="./java-code-examples"
```

### Translate a Docs Page

You can translate a MongoDB docs page written in reStructuredText from one
context (e.g. a specific driver) to another.

```shell
mongodb-ai translateDocsPage \
  --source="./docs-node/source/crud/insert.txt" \
  --targetDescription="Rewrite this using Java and the MongoDB Java Reactive Streams Driver."
```

## Development

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
   cd ../mongodb-artifact-generator
   # do stuff
   ```

### Add Commands

Add commands to `src/commands/`. The CLI automatically picks up any non-test .ts
file that default-exports a `yargs.CommandModule`. See existing commands for
example.
