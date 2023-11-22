# CLI Commands Reference

The MongoDB RAG Ingest CLI has the following commands.

You must first install the CLI before you can run it. See the [installation instructions in the Configuration documentation](./configure.md#install-the-ingest-cli).

For all commands, you can use the `--help` flag to get more information about the command.

## `pages`

Update `pages` data from [data sources](data-sources.md).

Options:

```txt
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --config   Path to config JS file.                                    [string]
  --source   A source name to load. If unspecified, loads all sources.  [string]
```

## `embed`

Update `embedded_content` data from the `pages` data.

Options:

```txt
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --config   Path to config JS file.                                    [string]
  --source   A source name to load. If unspecified, loads all sources.  [string]
  --since                                                    [string] [required]
```

## `all`

Run 'pages' and 'embed' for all data sources since last successful run of `all` command.
On the first run, it will run for all data sources.

Options:

```txt
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --config   Path to config JS file.                                    [string]
```
