import { MongoClient } from "mongodb";

import "dotenv/config";

async function main() {
  const client = await MongoClient.connect(
    process.env.MONGODB_CONNECTION_URI as string
  );
  try {
    await client.connect();

    const allDatabaseNames = await getAllDatabaseNames(client);

    const testDatabaseRegexes = [
      /^conversations-test-.*/,
      /^test-database-.*/,
      /^convo-msg-test-.*/,
    ];

    const testDatabaseNames = allDatabaseNames.filter((name) =>
      testDatabaseRegexes.some((regex) => regex.test(name))
    );

    if (testDatabaseNames.length === 0) {
      console.log("No test databases found.");
      return;
    }

    for (const testDatabaseName of testDatabaseNames) {
      console.log(`Dropping database ${testDatabaseName}`);
      await client.db(testDatabaseName).dropDatabase();
    }
  } finally {
    await client.close();
  }
}

main();

async function getAllDatabaseNames(client: MongoClient) {
  const admin = client.db("admin");
  const { databases } = (await admin.command({
    listDatabases: 1,
    nameOnly: true,
  })) as { databases: { name: string }[] };
  return databases.map((r) => r.name);
}
