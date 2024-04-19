import { MongoClient } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { FaqEntry } from "../../../lib/FaqEntry";

import "dotenv/config";

const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } = assertEnvVars({
  MONGODB_CONNECTION_URI: "",
  MONGODB_DATABASE_NAME: "",
});

type Datum = { created: string; instanceCount: number };

type Entry = {
  _id: string;
  question: string;
  series: Datum[];
};

export async function GET() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    const collection = db.collection<FaqEntry>("faq");

    const entries = (await collection
      .aggregate([
        {
          $match: {
            created: { $gt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: "$faqId",
            question: { $first: "$question" },
            series: {
              $addToSet: {
                created: "$created",
                instanceCount: "$instanceCount",
              },
            },
          },
        },
      ])
      .toArray()) as Entry[];

    const questionsByFaqId: Record<string, string> = {};

    const entryByCreated: Record<
      string /* created */,
      (Datum & { faqId: string })[]
    > = {};

    // Put entries into date buckets
    entries
      .filter((entry) => entry._id !== null)
      .forEach((entry) => {
        questionsByFaqId[entry._id] = entry.question;
        entry.series.sort((a, b) =>
          a.created.toString().localeCompare(b.created.toString())
        );
        entry.series.forEach((datum) => {
          const entries = (entryByCreated[datum.created] =
            entryByCreated[datum.created] ?? []);
          entries.push({ ...datum, faqId: entry._id });
          entries.sort((a, b) => b.instanceCount - a.instanceCount);
        });
      });

    const dataByFaqId: Record<string, { x: string; y: number | null }[]> = {};

    // In each date bucket...
    Object.entries(entryByCreated).forEach(([created, data]) => {
      data
        .sort((a, b) => {
          // Determine ranks
          return b.instanceCount - a.instanceCount;
        })
        .map(({ faqId, instanceCount }, rank) => {
          return { faqId, instanceCount, rank };
        })
        .forEach(({ faqId, rank }) => {
          // Add to data set bucketed by faqId
          const data = (dataByFaqId[faqId] = dataByFaqId[faqId] ?? []);
          data.push({ x: created, y: rank });
        });
    });

    // In each faqId bucket...
    const series = Object.entries(dataByFaqId)
      .filter(
        // Filter out anything that doesn't have at least one top 10 faq in the range
        ([_, data]) => data.find(({ y }) => y !== null && y < 10) !== undefined
      )
      .map(([faqId, data]) => {
        return {
          id: questionsByFaqId[faqId],
          data: data.filter(({ y }) => y !== null && y < 10),
        };
      });

    // Fill in 'null' wherever data is missing
    const xValues = new Set<string>();
    series.forEach(({ data }) => {
      data.forEach(({ x }) => xValues.add(x));
    });
    series.forEach(({ data }) => {
      data.push(
        ...Array.from(xValues.values())
          .filter((x) => data.find((datum) => datum.x === x) === undefined)
          .map((x) => ({ x, y: null }))
      );
      data.sort((a, b) => a.x.localeCompare(b.x));
    });

    console.log(JSON.stringify(series));

    return Response.json({ series });
  } finally {
    await client.close();
  }
}
