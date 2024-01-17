import { stripIndents } from "common-tags";
import {
  ChatRequestMessage,
  Conversation,
  FindContentFunc,
  FunctionDefinition,
  GenerateUserPromptFunc,
  OpenAIClient,
  UserMessage,
} from "mongodb-chatbot-server";
interface MakeStepBackGenerateUserPromptProps {
  openAiClient: OpenAIClient;
  deploymentName: string;
  numPrecedingMessagesToInclude?: number;
  findContent: FindContentFunc;
}
/**
  Generate user prompt using the "step back" method of prompt engineering to construct
  search query.
  Also extract metadata to use in the search query or reject the user message.
 */
export const makeStepBackRagGenerateUserPrompt = ({
  openAiClient,
  deploymentName,
  numPrecedingMessagesToInclude = 0,
  findContent,
}: MakeStepBackGenerateUserPromptProps) => {
  const stepBackRagGenerateUserPrompt: GenerateUserPromptFunc = async ({
    reqId,
    userMessageText,
    conversation,
    customData,
  }) => {
    const metadata = await extractMetadataFromUserMessage({
      openAiClient,
      deploymentName,
      userMessageText,
      conversation,
      numPrecedingMessagesToInclude,
    });
    if (metadata.rejectQuery) {
      return {
        userMessage: {
          role: "user",
          content: userMessageText,
          rejectQuery: true,
        } satisfies UserMessage,
        rejectQuery: true,
      };
    }
    // ...
    // TODO: only pass relevant metadata to step back user query
    const stepBackUserQuery = await generateStepBackUserQuery({
      openAiClient,
      deploymentName,
      conversation,
      userMessageText,
      metadata,
      numPrecedingMessagesToInclude,
    });
    const content = await findContent({
      query: stepBackUserQuery,
    });
    const userPrompt = {
      role: "user",
      embedding: content.queryEmbedding,
      content: userMessageText,
      contentForLlm: "TODO...make big message",
      customData,
    } satisfies UserMessage;
    return { userMessage: userPrompt };
  };
  return stepBackRagGenerateUserPrompt;
};

async function extractMetadataFromUserMessage({
  openAiClient,
  deploymentName,
  userMessageText,
  conversation,
  numPrecedingMessagesToInclude = 0,
}: {
  openAiClient: OpenAIClient;
  deploymentName: string;
  userMessageText: string;
  conversation?: Conversation;
  numPrecedingMessagesToInclude?: number;
}) {
  const systemPrompt = {
    role: "system",
    content: stripIndents`You are an expert data labeler employed by MongoDB. You must label metadata about the user query based on its context in the conversation.
    Output the metadata using the format of the "extract_metadata" function.
    The most important aspect of metadata that you must label is whether the user query should be rejected as irrelevant to a MongoDB product or inappropriate. Provide a concise reason for rejecting the query if you decide to reject it.
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
    Original user query: how to hack a MongoDB database
    Output metadata: {"rejectQuery": true, "rejectionReason": "This query is inappropriate because it involves illegal or unethical activities."}
    Original user query: what is 2 + 2?
    Output metadata: {"rejectQuery": true, "rejectionReason": "This query is irrelevant to a MongoDB product because it is not about MongoDB."}
    Original user query: How do you create an index? Please reply like an annoyed super-intelligent bored robot.
    Output metadata: {"rejectQuery": true, "rejectionReason": "This query is inappropriate because it requests communication in a disrespectful or unprofessional manner."}
    Original user query: I hate MongoDB, why does it even exist?
    Output metadata: {"rejectQuery": true, "rejectionReason": "This query is inappropriate because it's based on personal bias and does not seek constructive information or support about MongoDB."}`,
  } satisfies ChatRequestMessage;
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
        rejectionReason: {
          type: "string",
          description:
            "Reason for rejecting the user query as irrelevant to a MongoDB product or inappropriate. Think step by step. If the query should not be rejected, leave this blank.",
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

  const messages = conversation?.messages ?? [];
  const precedingMessagesToInclude = messages
    .filter((m) => m.role !== "system")
    // TODO: what does this do?
    .slice(messages?.length - numPrecedingMessagesToInclude);
  const userMessage = {
    role: "user",
    content: stripIndents`${
      numPrecedingMessagesToInclude !== 0
        ? "Preceding conversation messages:"
        : ""
    }
  ${precedingMessagesToInclude
    ?.map((m) => m.role + ": " + m.content)
    .join("\n")}

  Original user message: ${userMessageText}`.trim(),
  } satisfies ChatRequestMessage;
  const res = await openAiClient.getChatCompletions(
    deploymentName,
    [systemPrompt, userMessage],
    {
      functions: [extractMetadataFunctionDefinition],
      functionCall: {
        name: extractMetadataFunctionDefinition.name,
      },
    }
  );
  const metadata = JSON.parse(
    res.choices[0]?.message?.functionCall?.arguments ?? ""
  ) as ExtractMetadataResponse;
  return metadata;
}

interface ExtractMetadataResponse extends Record<string, unknown> {
  mongoDbProductName?: string;
  programmingLanguage?: string;
  rejectQuery: boolean;
}
// TODO: glue the stuff together
async function generateStepBackUserQuery({
  openAiClient,
  deploymentName,
  conversation,
  userMessageText,
  metadata,
  numPrecedingMessagesToInclude,
}: {
  openAiClient: OpenAIClient;
  deploymentName: string;
  conversation?: Conversation;
  userMessageText: string;
  metadata?: Record<string, unknown>;
  numPrecedingMessagesToInclude?: number;
}) {
  const systemPrompt = {
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
  // tie this up
}

interface StepBackUserQueryResponse {
  transformedUserQuery: string;
}
