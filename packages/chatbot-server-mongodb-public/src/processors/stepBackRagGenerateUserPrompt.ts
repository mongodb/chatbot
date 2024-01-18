import { stripIndents } from "common-tags";
import {
  Conversation,
  FindContentFunc,
  FunctionDefinition,
  GenerateUserPromptFunc,
  OpenAIClient,
  UserMessage,
} from "mongodb-chatbot-server";
import { extractMetadataFromUserMessage } from "./extractMetadataFromUserMessage";
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
