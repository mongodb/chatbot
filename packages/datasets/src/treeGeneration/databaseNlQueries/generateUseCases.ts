import "dotenv/config";
import { z } from "zod";
import { makeGenerateChildrenWithOpenAi } from "../generateTree";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import {
  DatabaseUseCase,
  DatabaseUseCaseSchema,
  DatabaseUserNode,
} from "./nodeTypes";

const useCaseSystemPrompt = `You are an expert user researcher who understands how different professionals use database information in their roles. Given a database user profile, generate realistic use cases that describe what information they need to retrieve from a database and why.

For each use case:
- Focus ONLY on information needs, not on specific queries or technical implementation
- Consider the user's job title, department, expertise, and experience level
- Create detailed scenarios that reflect real-world information needs they would have
- Emphasize the business context and purpose behind each information need
- Consider both routine information needs and occasional specialized requirements
- Include a balance of "simple", "moderate", and "complex" queries, as appropriate for a given user. Some users may have different balances, depending on their role.

Generate no more than 10 distinct use cases that reflect different information needs relevant to their responsibilities.`;

export const generateDatabaseUseCases = makeGenerateChildrenWithOpenAi<
  DatabaseUserNode,
  DatabaseUseCase
>({
  openAiClient: new AzureOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    endpoint: process.env.OPENAI_ENDPOINT!,
    apiVersion: process.env.OPENAI_API_VERSION!,
  }),
  clientConfig: {
    model: "gpt-4o",
    temperature: 0.5,
    seed: 42,
  },
  makePromptMessages: async ({
    data: user,
    parent: { data: databaseInfo },
  }) => {
    const message = `Generate information retrieval use cases for the following user:
    
Name: ${user.name}
Job Title: ${user.jobTitle}
Department: ${user.department}
Description: ${user.description}
Expertise: ${user.expertise.join(", ")}
Years of Experience: ${user.yearsOfExperience}

For a database with the following information:
Name: ${databaseInfo.name}
Description: ${databaseInfo.description}
Collections:
${databaseInfo.schema
  .map((c) => ` - Name: ${c.name}, Description: ${c.description}`)
  .join("\n")}

Based on this profile, what are the most realistic and specific information needs this person would have when working with a movie database?`;

    return [
      { role: "system", content: useCaseSystemPrompt },
      { role: "user", content: message },
    ];
  },
  response: {
    schema: z.array(DatabaseUseCaseSchema),
    name: "generate_use_cases",
    description: "An array of information retrieval use cases for the user",
  },
});
