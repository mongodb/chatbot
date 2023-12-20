import {
  ChatResponseMessage,
  FunctionDefinition,
  FunctionCall,
  FindContentFunc,
  FindContentResult,
  References,
  EmbeddedContent,
} from "mongodb-chatbot-server";
import yaml from "yaml";
import { strict as assert } from "assert";
import { stripIndents } from "common-tags";

export function makeOpenAiFunctionContentSearch({
  findContent,
}: {
  findContent: FindContentFunc;
}) {
  const name = "content_search";

  return {
    name,
    functionDefinition: {
      name,
      description: "Get search results for user query.",
      parameters: {
        type: "object",
        properties: {
          query: {
            description: stripIndents`A query to search for what the user wants.
            Expand the query to have more semantic meaning.
            Contextualize the query in the conversation. For example, if the user
            asks a follow up question, expand the follow up question to include
            context information from the previous conversation messages.

            Example 1:
            User input: add data python
            Generated query: How to add data to MongoDB with Pymongo?

            Example 2:
            <previous messages about finding data with python driver>
            User input: example where animalType is dog
            Generated query: How to find data in MongoDB with the Python driver where animalType property is dog?`,
            type: "string",
          },
          product: {
            description: stripIndents`The MongoDB product that the user is searching for.

            Options: MongoDB Atlas, Atlas Charts, Atlas Search, Aggregation Framework, MongoDB Server, Compass, MongoDB Connector for BI, Realm SDK, Driver, Atlas App Services, Atlas Streams, Atlas Vector Search ...other MongoDB products`,
            type: "string",
          },
          programmingLanguage: {
            description: stripIndents`The programming language that the user is searching for.
            If the user does not specify a programming language, use either 1) the programming language that the user has used in previous messages 2) 'shell' as a default if it's not clear what programming language should be used .

            Options: shell, javascript, typescript, python, java, csharp, cpp, ruby, kotlin, c, dart, php, rust, scala, swift, ...other popular programming languages`,
            type: "string",
          },
        },
        required: ["query", "product"],
      },
    } satisfies FunctionDefinition,
    async search(assistantFunctionCall: ChatResponseMessage): Promise<{
      message: ChatResponseMessage;
      queryEmbedding: number[];
      content: EmbeddedContent[];
    }> {
      assert(
        assistantFunctionCall?.functionCall?.name === name &&
          assistantFunctionCall.role === "assistant",
        `Only call this method in response to function call for '${name}'`
      );
      const functionCall = assistantFunctionCall.functionCall as FunctionCall;
      const { query, product, programmingLanguage } = JSON.parse(
        functionCall.arguments
      ) as PreprocessedQuery;
      const findQuery = yaml.stringify({ product, programmingLanguage, query });
      const { content, queryEmbedding } = await findContent({
        query: findQuery,
        ipAddress: "",
      });
      const message = convertFindContentResultsToMessage(content);
      return { queryEmbedding, message, content };
    },
  };
}

interface PreprocessedQuery {
  query: string;
  product: string;
  programmingLanguage?: string;
}

function convertFindContentResultsToMessage(
  foundContent: FindContentResult["content"]
): ChatResponseMessage {
  const texts = [...foundContent]
    .sort((a, b) => a.score - b.score)
    .map(({ text }) => {
      text;
    });
  const description = "Use these texts to answer the user's query.";
  const content = JSON.stringify({ description, texts });
  return {
    role: "function",
    content,
    toolCalls: [],
  };
}
