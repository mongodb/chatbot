import {
  DatabaseInfo,
  truncateDbOperationOutputForLlm,
} from "mongodb-rag-core/executeCode";
import {
  DatabaseUseCase,
  DatabaseUser,
  NaturalLanguageQuery,
} from "./nodeTypes";

export function makePromptDbInfo(databaseInfo: DatabaseInfo) {
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
Sample documents:
${JSON.stringify(truncateDbOperationOutputForLlm(c.examples))}
Indexes:
${c.indexes.map((i) => `${JSON.stringify(i)}`)}`
  )
  .join("\n")}`;
}

export function makePromptDbUserInfo(user: DatabaseUser) {
  return `## User Information

Name: ${user.name}
Job Title: ${user.jobTitle}
Description: ${user.description}`;
}

export function makePromptUseCaseInfo(useCase: DatabaseUseCase) {
  return `## Use Case

Use Case Title: ${useCase.title}
Use Case Description: ${useCase.description}
Data Needed: ${useCase.dataNeeded ? useCase.dataNeeded.join(", ") : "N/A"}`;
}

export function makePromptNaturalLanguageQueryInfo(
  query: NaturalLanguageQuery
) {
  return `## Natural Language Query

Query: ${query.query}
Intent: ${query.intent}
Complexity: ${query.complexity}
Collections: ${query.collections.join(", ")}
Results schema: ${query.resultsSchema}`;
}
