import {
  DatabaseInfo,
  getVerySimplifiedSchema,
  truncateDbOperationOutputForLlm,
} from "mongodb-rag-core/executeCode";

export function makeDatabaseInfoPrompt(databaseInfo: DatabaseInfo) {
  return `## Database Information

Name: ${databaseInfo.name}
Description: ${databaseInfo.description}
Latest Date: ${databaseInfo.latestDate} (use this to inform dates in queries)

### Collections

${databaseInfo.collections
  .map(
    (c) => `#### Collection \`${c.name}\`
Description: ${c.description}

Schema:
${c.schema}

Example documents:
${c.examples.map((d) => JSON.stringify(truncateDbOperationOutputForLlm(d)))}

Indexes:
${c.indexes.map((i) => `${JSON.stringify(i)}`)}`
  )
  .join("\n")}`;
}

export async function makeDatabaseInfoPromptSimple(databaseInfo: DatabaseInfo) {
  // Create an array of promises
  const collectionPromises = databaseInfo.collections.map(async (c) => {
    const schema = await getVerySimplifiedSchema(c.examples);
    return `#### Collection \`${c.name}\`

Schema:
${JSON.stringify(schema)}

Example documents:
${c.examples.map((d) => JSON.stringify(truncateDbOperationOutputForLlm(d)))}

Indexes:
${c.indexes
  .map((i) => {
    // Remove the generated description
    const { description, ...index } = i;
    return `${JSON.stringify(index)}`;
  })
  .join("\n")}`;
  });

  // Wait for all promises to resolve
  const collectionsText = await Promise.all(collectionPromises);

  return `## Database Information

Name: ${databaseInfo.name}
Description: ${databaseInfo.description}
Latest Date: ${databaseInfo.latestDate} (use this to inform dates in queries)

### Collections

${collectionsText.join("\n")}`;
}
