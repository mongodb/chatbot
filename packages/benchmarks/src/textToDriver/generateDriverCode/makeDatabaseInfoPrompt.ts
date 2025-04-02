import { DatabaseInfo } from "mongodb-rag-core/executeCode";

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
Indexes:
${c.indexes.map((i) => `${JSON.stringify(i)}`)}`
  )
  .join("\n")}`;
}
