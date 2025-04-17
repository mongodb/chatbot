import {
  DatabaseInfo,
  getVerySimplifiedSchema,
  truncateDbOperationOutputForLlm,
} from "mongodb-rag-core/executeCode";
import yaml from "yaml";

export type SchemaStrategy = "annotated" | "interpreted";

function makeDatabaseOverview(databaseInfo: DatabaseInfo) {
  return `## Database Information

Name: ${databaseInfo.name}
Description: ${databaseInfo.description}
Latest Date: ${databaseInfo.latestDate} (use this to inform dates in queries)`;
}

async function makeCollectionPrompt(
  collections: DatabaseInfo["collections"],
  schemaStrategy: SchemaStrategy
) {
  const collectionSchemas =
    schemaStrategy === "annotated"
      ? collections.map((c) => c.schema)
      : await Promise.all(
          collections.map(async (c) => {
            const verySimplified = await getVerySimplifiedSchema(c.examples);
            return typeof verySimplified === "string"
              ? verySimplified
              : prettyStringify(verySimplified);
          })
        );
  return `### Collections

${collections
  .map(
    (c, i) => `#### Collection \`${c.name}\`
Description: ${c.description}

Schema:
\`\`\`
${collectionSchemas[i]}
\`\`\`

Example documents:
\`\`\`
${c.examples.map((d) => prettyStringify(truncateDbOperationOutputForLlm(d)))}
\`\`\`

Indexes:
\`\`\`
${c.indexes.map((i) => `${prettyStringify(i)}`)}`
  )
  .join("\n\n")}
\`\`\``;
}

export async function makeDatabaseInfoPrompt(
  databaseInfo: DatabaseInfo,
  schemaStrategy: SchemaStrategy = "annotated"
) {
  return `${makeDatabaseOverview(databaseInfo)}

${await makeCollectionPrompt(databaseInfo.collections, schemaStrategy)}`;
}

function prettyStringify(obj: unknown, format: "json" | "yaml" = "json") {
  return format === "json" ? JSON.stringify(obj, null, 2) : yaml.stringify(obj);
}
