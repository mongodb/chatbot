import { stripIndents } from "common-tags";
import {
  Conversation,
  FunctionDefinition,
  GenerateUserPromptFunc,
  OpenAIClient,
} from "mongodb-chatbot-server";

interface MakeStepBackGenerateUserPromptProps {
  openAiClient: OpenAIClient;
  deploymentName: string;
}
const makeStepBackGenerateUserPrompt = ({
  openAiClient,
  deploymentName,
}: MakeStepBackGenerateUserPromptProps) => {
  const stepBackGenerateUserPrompt: GenerateUserPromptFunc = async ({
    reqId,
    userMessageText,
    conversation,
    customData,
  }) => {
    return {
      userMessage: { role: "user", content: "What else can I help you with?" },
    };
  };
  return stepBackGenerateUserPrompt;
};

async function extractMetadataFromUserMessage({
  userMessageText,
  conversation,
  precedingMessagesToInclude,
}: {
  userMessageText: string;
  conversation: Conversation;
  precedingMessagesToInclude?: number;
}) {
  const systemPrompt = {
    role: "system",
    content: stripIndents`You are an expert data labeler employed by MongoDB. You must label metadata about the user query based on its context in the conversation.
    Output the metadata using the format of the "extract_metadata" function.
    Your pay is determined by the accuracy of your labels as judged against other expert labelers, so do excellent work to maximize your earnings to support your family.

    Examples of extracting metadata:
    Original user query: aggregate data
    Output metadata: {"programmingLanguage":"javascript","mongoDbProduct":"Aggregation Framework", "rejectQuery": false}
    Original user query:  how to create a new cluster atlas
    Output metadata: {"mongoDbProduct":"MongoDB Atlas", "rejectQuery": false}
    Original user query: Does atlas search support copy to fields
    Output metadata: {"mongoDbProduct":"Atlas Search", "rejectQuery": false}
    Original user query: pymongo insert data
    Output metadata: {"programmingLanguage":"python","mongoDbProduct":"Driver", "rejectQuery": false}

    Examples of rejecting a query:
    TODO...`,
  };
  const extractMetadataFunctionDefinition: FunctionDefinition = {
    name: "extract_metadata",
    description: "Extract metadata from a user message",
    parameters: {
      type: "object",
      properties: {
        programmingLanguage: {
          type: "string",
          description:
            'Programming languages present in the content ordered by relevancy. If no programming language is present and the user is asking for a code example, include "javascript".',
          default: "javascript",
          enum: [
            "shell",
            "javascript",
            "typescript",
            "python",
            "java",
            "csharp",
            "cpp",
            "ruby",
            "kotlin",
            "c",
            "dart",
            "php",
            "rust",
            "scala",
            "swift",
          ],
        },
        mongoDbProduct: {
          type: "string",
          description: stripIndents`One or more MongoDB products present in the content. Order by relevancy. Include "Driver" if the user is asking about a programming language with a MongoDB driver.
          Example values: ["MongoDB Atlas", "Atlas Charts", "Atlas Search", "Atlas CLI", "Aggregation Framework", "MongoDB Server", "Compass", "MongoDB Connector for BI", "Realm SDK", "Driver", "Atlas App Services", "Atlas Vector Search", "Atlas Stream Processing", "Atlas Triggers", "Atlas Device Sync", "Atlas Data API", ...other MongoDB products]`,
        },
        rejectQuery: {
          type: "boolean",
          description:
            "Should the user query be rejected as irrelevant to a MongoDB product or inappropriate?",
        },
      },
      required: ["rejectQuery"],
    },
  };
  // TODOs: add generate user prompt function
  // generate response using openai
}

interface ExtractMetadataResponse {
  mongoDbProductName?: string;
  programmingLanguage?: string;
  rejectQuery: boolean;
}

async function generateStepBackUserQuery({
  openAiClient,
  deploymentName,
  conversation,
  userMessageText,
  precedingMessagesToInclude,
}: {
  openAiClient: OpenAIClient;
  deploymentName: string;
  conversation: Conversation;
  userMessageText: string;
  precedingMessagesToInclude?: number;
}) {
  const systemPrompt = {
    role: "system",
    content: stripIndents`Your purpose is to generate a search query for a given user input.
    You are doing this for MongoDB, and all queries relate to MongoDB products.
    When constructing the query, take a "step back" to generate a more general search query that finds the data relevant to the user query if relevant.
    You should also transform the user query into a fully formed question, if relevant.

    TODO: add examples...
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
  };
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
}

interface StepBackUserQueryResponse {
  transformedUserQuery: string;
}
