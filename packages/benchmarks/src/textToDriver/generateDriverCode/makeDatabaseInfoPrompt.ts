import {
  DatabaseInfo,
  getVerySimplifiedSchema,
  truncateDbOperationOutputForLlm,
} from "mongodb-rag-core/executeCode";
import yaml from "yaml";

export type SchemaStrategy = "annotated" | "interpreted" | "none";

// TODO: support annotated`
function makeDatabaseOverview(databaseInfo: DatabaseInfo, annotated: boolean) {
  return `## Database Information

Name: ${databaseInfo.name}
${annotated ? `Description: ${databaseInfo.description}` : ""}
Latest Date: ${databaseInfo.latestDate} (use this to inform dates in queries)`;
}

async function makeCollectionPrompt(
  collections: DatabaseInfo["collections"],
  schemaStrategy: SchemaStrategy
) {
  const collectionsData =
    schemaStrategy === "annotated"
      ? collections
      : await Promise.all(
          collections.map(async (c) => {
            const verySimplifiedSchema = await getVerySimplifiedSchema(
              c.examples
            );
            // Remove descriptions
            const simplifiedIndexes = c.indexes.map(
              ({ description, ...index }) => index
            );

            const simplifiedCollection: DatabaseInfo["collections"][number] = {
              name: c.name,
              examples: c.examples,
              indexes: simplifiedIndexes,
              description: "",

              schema:
                typeof verySimplifiedSchema === "string"
                  ? verySimplifiedSchema
                  : prettyStringify(verySimplifiedSchema),
            };
            return simplifiedCollection;
          })
        );
  return `### Collections

${collectionsData
  .map(
    (c) => `#### Collection \`${c.name}\`
${c.description ? `Description: ${c.description}\n` : ""}
Schema:
\`\`\`
${c.schema}
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
  if (schemaStrategy === "none") {
    return `## Database Information

Name: ${databaseInfo.name}
Latest date: ${databaseInfo.latestDate}

### Collections

${databaseInfo.collections
  .map(
    (c) => `#### Collection \`${c.name}\`

Example documents:
\`\`\`
${c.examples.map((d) => prettyStringify(truncateDbOperationOutputForLlm(d)))}
\`\`\``
  )
  .join("\n\n")}`;
  }
  return `${makeDatabaseOverview(databaseInfo, schemaStrategy === "annotated")}

${await makeCollectionPrompt(databaseInfo.collections, schemaStrategy)}`;
}

function prettyStringify(obj: unknown, format: "json" | "yaml" = "json") {
  return format === "json" ? JSON.stringify(obj, null, 2) : yaml.stringify(obj);
}
