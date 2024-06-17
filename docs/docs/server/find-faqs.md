# Find Frequently Asked Questions

You can use the "FAQ Finder" tool to analyze historic messages in your database
and find the most common topics that users have chatted about.

You can use these FAQs to:

- understand how users are interacting with your chatbot
- define [verified answers](./verified-answers) for the most common requests

:::info
The framework and this tool refer to these topics as "frequently asked
questions", but it can handle any user input even if they're not in the form of
a question.
:::

## How It Works

The FAQ Finder runs a clustering algorithm in your chatbot's vector embedding
space. Specifically, it runs [DBSCAN](https://en.wikipedia.org/wiki/DBSCAN) on
the query embeddings your server generates for each incoming user message.

The tool combines messages into semantically similar groups and then sorts the
groups by size (i.e. number of messages in the group). You can then sample or
generate a representative question for the entire group.

## Use the FAQ Finder

### 1. Configure Your Environment

The FAQ Finder is a script in the `scripts` package of the chatbot framework
repo. You need to configure it before you can run it.

Define a `.env` file for the `scripts` package that includes the following
values. Make sure to replace the placeholders with your app's values.

```python title="/packages/scripts/.env"
# The "from" cluster/database denotes where your chatbot conversation data is stored
FROM_CONNECTION_URI=<connection_uri>
FROM_DATABASE_NAME=<database_name>
# The "to" cluster/database/collection denotes where the FAQ data will be stored
TO_CONNECTION_URI=<connection_uri>
TO_DATABASE_NAME=<database_name>
TO_FAQ_COLLECTION_NAME=<collection_name>
```

### 2. Run the FAQ Finder

Once the tool is configured, you can run it from the command line.

From the `scripts` directory:

```sh
npm run findFaq
```

Or from the repository root:

```sh
npm run scripts:findFaq
```

After you run the tool, the "to" collection defined in your configuration
contains the FAQ groups.
