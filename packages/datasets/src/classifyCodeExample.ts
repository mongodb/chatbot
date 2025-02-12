import "dotenv/config";
import { strict as assert } from "assert";
import { START_SNIPPET, END_SNIPPET } from "./contextualizeCodeBlock.js";
import { OpenAI, AzureOpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars } from "mongodb-rag-core";
import { OPENAI_ENV_VARS } from "./EnvVars.js";

const {
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars(OPENAI_ENV_VARS);

const classificationTypes: ClassificationType[] = [
  {
    type: "usage_example",
    description: "Example of how to use a library or function",
    examples: [
      {
        text: `\`\`\`csharp
var planetList = db.Planets.OrderBy(o => o.hasRings).ThenBy(o => o.name);

    foreach (var p in planetList)
    {
       Console.WriteLine("Has rings: " + p.hasRings + ", Name: " + p.name);
    }
\`\`\``,
      },
      {
        text: `\`\`\`javascript
  { $merge: { into: "myOutput", on: "_id", whenMatched: "replace", whenNotMatched: "insert" } }
\`\`\``,
      },
    ],
  },
  {
    type: "api_reference",
    description: "Abstract definition of how to use an API or function",
    examples: [
      {
        text: `\`\`\`javascript
{ $merge: {
     into: <collection> -or- { db: <db>, coll: <collection> },
     on: <identifier field> -or- [ <identifier field1>, ...],  // Optional
     let: <variables>,                                         // Optional
     whenMatched: <replace|keepExisting|merge|fail|pipeline>,  // Optional
     whenNotMatched: <insert|discard|fail>                     // Optional
} }
\`\`\``,
      },
    ],
  },
  {
    type: "execution_output",
    description: "Output of a code snippet",
    examples: [
      {
        text: `\`\`\`
Found listing(s) with at least 4 bedrooms and 2 bathrooms:
1. name: Beautiful Beach House
    _id: 5db6ed14f2e0a60683d8fe44
    bedrooms: 4
    bathrooms: 2.5
    most recent review date: Mon Oct 28 2
2. name: Spectacular Modern Uptown Duplex
    _id: 582364
    bedrooms: 4
    bathrooms: 2.5
    most recent review date: Wed Mar 06 2019
\`\`\``,
      },
    ],
  },
  {
    type: "error_message",
    description: "An error message",
    examples: [
      {
        text: `\`\`\`
Command failed with error 18 (AuthenticationFailed): 'Authentication
    failed.' on server localhost:27017.
\`\`\``,
      },
    ],
  },
  {
    type: "example_data",
    description: "Example of data",
    examples: [
      {
        text: `\`\`\`
{ "_id" : 1, "name" : "Restaurant A" }
{ "_id" : 2, "name" : "Restaurant B" }
{ "_id" : 3, "name" : "Restaurant D" }
\`\`\``,
      },
    ],
  },
  {
    type: "cli_command",
    description: "Command input into command line interface",
    examples: [
      {
        text: `\`\`\`shell
sudo pecl install mongodb
\`\`\``,
      },
      {
        text: `\`\`\`
atlas accesslogs list --output json --projectId 618d48e05277a606ed2496fe --clusterName Cluster0
\`\`\``,
      },
    ],
  },
  {
    type: "unknown",
    description:
      "Unknown classification type. The code example doesn't easily fit into any of the other categories.",
  },
];
const makeSystemPrompt = (
  contextStr: string
): string => `Your job is to classify a code example into one of the following categories.
This information will be used to train an LLM, so precision is incredibly important.
Only generate questions about the code snippet wrapped with ${START_SNIPPET}{snippet}${END_SNIPPET}. Use the rest of the information as context to assist generating questions.

Classification categories:
${classificationTypes
  .map(({ type, description }) => `- ${type}: ${description}`)
  .join("\n")}

Examples:
${classificationTypes
  .map(({ examples, type }) =>
    examples
      ?.map(({ text }) => `Code:\n${text}\nClassification: ${type}`)
      .join("\n")
  )
  .join("\n")}

Code snippet with context:
${contextStr}`;

const classifyCodeExampleFunc: OpenAI.FunctionDefinition = {
  name: "classify_code_example",
  description: "Classify the type of code example",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: classificationTypes.map(({ type }) => type),
        description: "Type of code example",
      },
    },
    required: ["type"],
    additionalProperties: false,
  },
};

export function makeClassifyCodeExample() {
  assert(OPENAI_API_KEY, "OPENAI_API_KEY is required");
  assert(OPENAI_ENDPOINT, "OPENAI_ENDPOINT is required");
  assert(
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    "OPENAI_CHAT_COMPLETION_DEPLOYMENT is required"
  );
  const openAiClient = new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  });
  return async function classifyCodeExample({
    text,
  }: {
    text: string;
  }): Promise<string> {
    const result = await openAiClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: makeSystemPrompt(text),
        },
      ],
      model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      temperature: 0,
      max_tokens: 300,
      functions: [classifyCodeExampleFunc],
      function_call: {
        name: classifyCodeExampleFunc.name,
      },
    });
    const classificationType = JSON.parse(
      result?.choices?.[0].message?.function_call?.arguments ?? ""
    ).type as string;
    return classificationType;
  };
}

interface ClassificationType {
  type: string;
  description: string;
  /**
    Useful for few-shot examples in the system prompt
   */
  examples?: {
    text: string;
  }[];
}
