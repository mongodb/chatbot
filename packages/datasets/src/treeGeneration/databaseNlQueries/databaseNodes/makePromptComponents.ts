import { DatabaseInfo } from "mongodb-rag-core/executeCode";
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
Indexes:
${c.indexes.map((i) => `${JSON.stringify(i)}`)}`
  )
  .join("\n")}`;
}

export function makePromptDbUserInfo(user: DatabaseUser) {
  return `## User Information

Name: ${user.name}
Job Title: ${user.jobTitle}
Department: ${user.department}
Expertise: ${user.expertise.join(", ")}
Years of Experience: ${user.yearsOfExperience}`;
}

export function makePromptUseCaseInfo(useCase: DatabaseUseCase) {
  return `## Use Case

Use Case Title: ${useCase.title}
Use Case Description: ${useCase.description}
Complexity: ${useCase.complexity}
Frequency: ${useCase.frequency}
Data Needed: ${useCase.dataNeeded ? useCase.dataNeeded.join(", ") : "N/A"}`;
}

export function makePromptNaturalLanguageQueryInfo(
  query: NaturalLanguageQuery
) {
  return `## Natural Language Query

Query: ${query.query}
Complexity: ${query.complexity}`;
}
