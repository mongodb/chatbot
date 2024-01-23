import { stripIndents } from "common-tags";
import { Message, Conversation } from "mongodb-chatbot-server";
import {
  OpenAIClient,
  FunctionDefinition,
  ChatRequestMessage,
} from "@azure/openai";

/**
  Generate user query using the ["step back" method of prompt engineering](https://arxiv.org/abs/2310.06117).
 */
export async function makeStepBackUserQuery({
  openAiClient,
  deploymentName,
  messages,
  userMessageText,
  metadata,
}: {
  openAiClient: OpenAIClient;
  deploymentName: string;
  messages: Message[];
  userMessageText: string;
  metadata: Record<string, any>;
}) {
  const systemMessage = {
    role: "system",
    content: stripIndents`Your purpose is to generate a search query for a given user input.
      You are doing this for MongoDB, and all queries relate to MongoDB products.
      When constructing the query, take a "step back" to generate a more general search query that finds the data relevant to the user query if relevant.
      You should also transform the user query into a fully formed question, if relevant.

      Examples of taking a step back when relevant:
      Original user input: aggregate filter where flowerType is rose
      Step back user query: How do I filter by specific field value in a MongoDB aggregation pipeline?

      Original user input: How long does it take to import 2GB of data?
      Step back user query: What affects the rate of data import in MongoDB?

      Original user input: how to display the first five
      Step back user query: How do I limit the number of results in a MongoDB query?

      Examples of not taking a step back when query is general enough:
      Original user input: aggregate
      Step back user query: Overview of aggregation in MongoDB

      Original user input: $match
      Step back user query: What is the $match stage in a MongoDB aggregation pipeline?
  `,
  } satisfies ChatRequestMessage;
  const userMessage = generateStepBackUserMessage({
    userMessageText,
    messages,
    metadata,
  });

  const stepBackUserQuery: FunctionDefinition = {
    name: "step_back_user_query",
    description: "Create a user query using the 'step back' method.",
    parameters: {
      type: "object",
      properties: {
        transformedUserQuery: {
          type: "string",
          description: "Transformed user query",
        },
      },
      required: ["transformedUserQuery"],
    },
  };
  const result = await openAiClient.getChatCompletions(
    deploymentName,
    [systemMessage, userMessage],
    {
      functions: [stepBackUserQuery],
      functionCall: {
        name: stepBackUserQuery.name,
      },
      temperature: 0,
    }
  );
  const stepBackUserQueryResponse = result.choices[0].message;
  if (!stepBackUserQueryResponse) {
    throw new Error("No response from OpenAI");
  }
  const args = stepBackUserQueryResponse.functionCall?.arguments;
  if (
    !args ||
    stepBackUserQueryResponse.functionCall?.name !== stepBackUserQuery.name
  ) {
    throw new Error("Invalid response from OpenAI: " + JSON.stringify(result));
  }
  const { transformedUserQuery } = JSON.parse(
    args
  ) as StepBackUserQueryResponse;
  return transformedUserQuery;
}

interface StepBackUserQueryResponse {
  transformedUserQuery: string;
}

function generateStepBackUserMessage({
  userMessageText,
  messages,
  metadata,
}: {
  userMessageText: string;
  messages: Message[];
  metadata?: Record<string, any>;
  numPrecedingMessagesToInclude?: number;
}) {
  return {
    role: "user",
    content: stripIndents`Previous messages:
      ${messages
        .map((message) => message.role.toUpperCase() + ": " + message.content)
        .join("\n")}
      ${metadata ? "Metadata: " + JSON.stringify(metadata) : ""}
      Original user input: ${userMessageText}`,
  } satisfies ChatRequestMessage;
}
