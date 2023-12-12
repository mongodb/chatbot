import { MongoClient, ObjectId } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { promises as fs } from "fs";
import path from "path";

import "dotenv/config";

const SAMPLE_SIZE = 100;
const OUTPUT_DIRECTORY = "./sampled-pages";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

type Page = {
  _id: ObjectId;
  sourceName: string;
  url: string;
  action: string;
  body: string;
  updated: Date;
  title?: string;
  tags?: string | string[];
  metadata?: object;
};

async function prepareOutputDirectory() {
  const res = await fs.mkdir(OUTPUT_DIRECTORY, { recursive: true });
  return res;
}

async function savePageMarkdown(page: Page) {
  const res = await fs.writeFile(
    path.join(
      OUTPUT_DIRECTORY,
      `${page.sourceName}_${page.title?.replaceAll(/\//g, "_") ?? page._id}.md`
    ),
    page.body
  );
  return res;
}

function partition<T, Pass extends T = T, Fail extends T = T>(
  arr: T[],
  test: (elem: T) => boolean
) {
  type PassFail = [Pass[], Fail[]];
  const passes: Pass[] = [];
  const fails: Fail[] = [];
  const baseAccumulator: PassFail = [passes, fails];
  return arr.reduce((acc, elem) => {
    const [passes, fails] = acc;
    return test(elem)
      ? ([[...passes, elem], fails] as PassFail)
      : ([passes, [...fails, elem]] as PassFail);
  }, baseAccumulator);
}

function partitionPromiseResults<T>(arr: PromiseSettledResult<T>[]) {
  return partition<
    PromiseSettledResult<T>,
    PromiseFulfilledResult<T>,
    PromiseRejectedResult
  >(arr, (x) => x.status === "fulfilled");
}

(async function main() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    const pages = await db
      .collection<Page>("pages")
      .aggregate<Page>([{ $sample: { size: SAMPLE_SIZE } }])
      .toArray();

    await prepareOutputDirectory();
    const pageWritePromises = pages.map((page) => savePageMarkdown(page));
    const results = await Promise.allSettled(pageWritePromises);

    const [successes, failures] = partitionPromiseResults(results);
    console.log(`Successfully wrote ${successes.length} pages.`);
    if (failures.length > 0) {
      console.error(`Failed to write ${failures.length} pages`);
      for (const failure of failures) {
        console.error(failure.reason);
      }
    }
  } finally {
    await client.close();
  }
})();
