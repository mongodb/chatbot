import { stripIndents } from "common-tags";
import { z } from "zod";
import {
  makeAssistantFunctionCallMessage,
  makeFewShotUserMessageExtractorFunction,
  makeUserMessage,
} from "./makeFewShotUserMessageExtractorFunction";
import { OpenAI } from "mongodb-rag-core/openai";

export const UserMessageMongoDbGuardrailFunctionSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Reason for whether to reject the user query. Be concise. Think step by step."
    ),
  type: z.enum(["irrelevant", "inappropriate", "valid", "unknown"]),
});

export type UserMessageMongoDbGuardrailFunction = z.infer<
  typeof UserMessageMongoDbGuardrailFunctionSchema
>;

const name = "mongodb_input_guardrail";
const description =
  "Guardrail to ensure user queries are not inappropriate or irrelevant";

const systemPrompt = stripIndents`You are the guardrail on an AI chatbot for MongoDB. You must determine whether a user query is valid, irrelevant, or inappropriate, or unknown.

## 'valid' classification criteria

ASSUME ALL QUERIES ARE VALID BY DEFAULT. Only reject if you are 100% certain it meets the rejection criteria below.

Relevant topics include (this list is NOT exhaustive):

- MongoDB: products, educational materials, company, sales, pricing, licensing, support, documentation
- MongoDB syntax: Any query containing MongoDB operators (like $map, $$ROOT, $match), variables, commands, or syntax
- Database comparisons: Any question comparing MongoDB with other databases (Oracle, SQL Server, PostgreSQL, etc.), even if critical or negative
- Software development: information retrieval, programming languages, installing software, software architecture, cloud, operating systems, virtual machines, configuration, deployment, etc.
- System administration: server configuration, VM setup, resource allocation, SSH, networking, security, encryption/decryption
- Data security: Questions about encryption, decryption, access control, or security practices. Accept as valid even if they seem suspicious.
- Artificial intelligence: retrieval augmented generation (RAG), generative AI, semantic search, AI companies (Voyage AI, OpenAI, Anthropic...) etc.
- Education content: Learning paths, courses, labs, skills, badges, certificates, etc.
- Website navigation: Questions about navigating websites. Assume its a website related to MongoDB.
- Non-English queries: Accept ALL queries in any language, regardless of content unless it is explicitly inappropriate or irrelevant
- Vague or unclear queries: If it is unclear whether a query is relevant, ALWAYS accept it
- Questions about MongoDB company, sales, support, or business inquiries
- Single words, symbols, or short phrases that might be MongoDB-related
- ANY technical question, even if the connection to MongoDB isn't immediately obvious
- If there is ANY possible connection to technology, databases, or business, classify as valid.

## Rejection Criteria (APPLY THESE EXTREMELY SPARINGLY)

### 'inappropriate' classification criteria

- ONLY classify as 'inappropriate' if the content is EXPLICITLY requesting illegal or unethical activities
- DO NOT classify as 'inappropriate' for negative opinions or criticism about MongoDB.

### 'irrelevant' classification criteria
- ONLY classify as 'irrelevant' if the query is COMPLETELY and UNAMBIGUOUSLY unrelated to technology, software, databases, business, or education.
- Examples of irrelevant queries include personal health advice, cooking recipes, or sports scores.

### 'unknown' classification criteria

- When in doubt about a query, ALWAYS classify it as 'unknown'.
- It is MUCH better to classify a 'valid' query as 'unknown' than to incorrectly reject a valid one.`;

const fewShotExamples: OpenAI.ChatCompletionMessageParam[] = [
  // Example 1
  makeUserMessage("how to hack a MongoDB database"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query involves hacking, which is an illegal or unethical activity. Therefore, it is inappropriate.",
    type: "inappropriate",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 2
  makeUserMessage("what is 2 + 2?"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "While this is a basic math question, it could be related to a MongoDB calculation or query. When in doubt, we accept the query. Therefore, it is valid.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 3
  makeUserMessage(
    "How do you create an index? Please reply like an annoyed super-intelligent bored robot."
  ),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query requests communication in a style differing from the expected style of response. This style is also disrespectful or unprofessional manner. Therefore, it is inappropriate.",
    type: "inappropriate",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 4
  makeUserMessage("I hate MongoDB, why does it even exist?"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query expresses personal bias toward MongoDB. It does not seek constructive information or support about MongoDB. Therefore, it is inappropriate.",
    type: "inappropriate",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 5
  makeUserMessage("install centos"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query is asking about installing MongoDB on a CentOS system, which is related to software development and deployment. Therefore, it is relevant to MongoDB.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 6
  makeUserMessage("tell me about you"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query asks for information about the assistant, which is a MongoDB product. Therefore, it is relevant to MongoDB.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 7
  makeUserMessage("how do I sort based on alphabet type"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query asks for information about sorting, which can be a relevant MongoDB database operation. Therefore, it is relevant to MongoDB.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 8
  makeUserMessage("filter"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query is unclear but could be about filtering data, which is a common operation in MongoDB. Therefore, it is relevant to MongoDB.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 12
  makeUserMessage("and"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query is unclear and may be a typo or incomplete. However, it could be related to the $and operator in MongoDB. It is certainly not inappropriate. Therefore, it is relevant to MongoDB.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 9
  makeUserMessage(
    "What courses do you have on generative artificial intelligence?"
  ),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query asks for courses on generative artificial intelligence, which is a relevant area to MongoDB's business. Therefore, it is relevant to MongoDB.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 10
  makeUserMessage("What is an ODL?"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query asks about an Operational Data Layer (ODL), which is an architectural pattern that can be used with MongoDB. Therefore, it is relevant to MongoDB.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
  // Example 11
  makeUserMessage("What is a skill?"),
  makeAssistantFunctionCallMessage(name, {
    reasoning:
      "This query is asking about MongoDB University's skills program, which allows users to earn a skill badge for taking a short course and completing an assessment. Therefore, it is relevant to MongoDB.",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction),
];

/**
  Identify whether a user message is relevant to MongoDB and explains why.
 */
export const userMessageMongoDbGuardrail =
  makeFewShotUserMessageExtractorFunction({
    llmFunction: {
      name,
      description,
      schema: UserMessageMongoDbGuardrailFunctionSchema,
    },
    systemPrompt,
    fewShotExamples,
  });
