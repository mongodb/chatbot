# CLI Command Reference

The MongoDB Chatbot Evaluation CLI has the following commands.

You must first install the CLI before you can run it. See the [installation documentation](./index.md#install).

For all commands, you can use the `--help` flag to get more information about the command.

Run commands with the `mongodb-chatbot-evaluation` CLI application:

```sh
mongodb-chatbot-evaluation <command> [options]
```

## `generate`

Create generated data to be used in evaluation.

Options:

```txt
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --config   Path to config JS file.                                    [string]
  --name     Name of the data generation.                    [string] [required]
```

## `evaluate`

Evaluate the generated data.

Options:

```txt
  --version             Show version number                            [boolean]
  --help                Show help                                      [boolean]
  --config              Path to config JS file.                         [string]
  --name                Name of the evaluation.              [string] [required]
  --generatedDataRunId  RunId for a 'generate' command that you want to create
                        evaluations for.                     [string] [required]
```

## `report`

Generate a report from the evaluation data.

Options:

```txt
  --version           Show version number                              [boolean]
  --help              Show help                                        [boolean]
  --config            Path to config JS file.                           [string]
  --name              Name of the report.                    [string] [required]
  --evalResultsRunId  RunId for an 'evaluate' command that you want to create a
                      report for.                            [string] [required]
```
