import { MongoClient } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import * as yaml from "yaml";
import { promises as fs } from "fs";

import "dotenv/config";

type YamlEntry = {
  [key: string]: unknown;
  references: { url: string; title?: string }[];
};

const { FIND_PAGE_TITLES_CONNECTION_URI, FIND_PAGE_TITLES_DATABASE_NAME } =
  assertEnvVars({
    FIND_PAGE_TITLES_CONNECTION_URI: "",
    FIND_PAGE_TITLES_DATABASE_NAME: "",
  });

async function main() {
  const yamlPath = process.argv[process.argv.length - 1];
  if (!/\.yaml/i.test(yamlPath)) {
    throw new Error(
      `Expected 1 argument ending in .yaml - path to verified answers yaml`
    );
  }

  const source = await fs.readFile(yamlPath, "utf8");
  const yamlEntries = yaml.parse(source) as YamlEntry[];
  if (
    !Array.isArray(yamlEntries) ||
    yamlEntries[0]?.references[0]?.url === undefined
  ) {
    throw new Error(`Invalid verified answers file: ${yamlPath}`);
  }

  const client = await MongoClient.connect(FIND_PAGE_TITLES_CONNECTION_URI);
  try {
    const db = client.db(FIND_PAGE_TITLES_DATABASE_NAME);
    const collection = db.collection<{ metadata?: { pageTitle?: string } }>(
      "embedded_content"
    );

    const newEntries = await Promise.all(
      yamlEntries.map(async ({ references, ...entry }) => {
        return {
          ...entry,
          references: await Promise.all(
            references.map(async ({ url, title }) => {
              return {
                url,
                title:
                  title ??
                  (
                    await collection.findOne({
                      url: url.replace(/[?#].*$/, ""),
                    })
                  )?.metadata?.pageTitle,
              };
            })
          ),
        };
      })
    );

    console.log(yaml.stringify(newEntries));
  } finally {
    await client.close();
  }
}

main();
