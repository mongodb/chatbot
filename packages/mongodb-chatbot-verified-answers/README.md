# MongoDB Verified Answer CLI

The Verified Answer CLI imports answers specified in a yaml file into the database.

## To import answers into the database:

Write answers in a yaml file like `verified-answers.yaml` or make updates to an existing file.

In the root directory, run `npm run build`.

Enter the mongodb-chatbot-verified-answers directory with `cd packages/mongodb-chatbot-verified-answers`.

Run `npm run upload -- import <path to verified-answers.yaml>`.

If successful, you will see a success message that looks like:

```sh
{ failed: 0, updated: 0, created: 18, deleted: 0 }
