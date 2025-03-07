import { OpenAI } from "mongodb-rag-core/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { PromisePool } from "@supercharge/promise-pool";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { GenerationNode, WithParentNode } from "./GenerationNode";
import { LlmOptions } from "./databaseNlQueries/LlmOptions";

export type GenerateChildren<
  ParentNode extends GenerationNode<unknown, string | undefined> | null,
  ChildNode extends WithParentNode<
    GenerationNode<unknown, string | undefined>,
    ParentNode
  >
> = (
  parent: ParentNode,
  llmOptions: LlmOptions,
  numChildren: number
) => Promise<ChildNode[]>;

export interface ResponseFunction {
  name: string;
  description?: string;

  /** 
    The schema of the response. Includes the schema of the children.
    Can also include options like refinements, etc.
    */
  schema: z.ZodSchema;
}

export interface MakeGenerateChildrenWithOpenAiParams<
  ParentNode extends GenerationNode<unknown, string | undefined> | null,
  ChildNode extends WithParentNode<
    GenerationNode<unknown, string | undefined>,
    ParentNode
  >
> {
  /**
    Function that generates a prompt for a parent node.
    */
  makePromptMessages: (
    parentNode: ParentNode,
    numChildren: number
  ) => Promise<OpenAI.ChatCompletionMessageParam[]>;

  /**
    Information on what the elements of the response should look like.
   */
  response: ResponseFunction;

  /**
    Filter child nodes out of the response
   */
  filterNodes?: {
    filter: (node: ChildNode["data"]) => Promise<boolean>;
    /**
      @default 1
     */
    concurrency?: number;
  };

  /**
    Name for child type.
   */
  childType?: ChildNode["type"];
}

export function makeGenerateChildrenWithOpenAi<
  ParentNode extends GenerationNode<unknown, string | undefined> | null,
  ChildNode extends WithParentNode<
    GenerationNode<unknown, string | undefined>,
    ParentNode
  >
>({
  makePromptMessages,
  response,
  filterNodes,
}: MakeGenerateChildrenWithOpenAiParams<
  ParentNode,
  ChildNode
>): GenerateChildren<ParentNode, ChildNode> {
  return async function generateChildrenWithOpenAI(
    parent: ParentNode,
    llmOptions: LlmOptions,
    numChildren
  ): Promise<ChildNode[]> {
    const messages = await makePromptMessages(parent, numChildren);

    const responseSchema = z.object({
      items: z.array(response.schema),
    });
    const { openAiClient, ...clientConfig } = llmOptions;

    // Loop running tool calls to generate
    // exactly the correct amount of children.
    const parsedChildren: ChildNode["data"][] = [];
    while (parsedChildren.length < numChildren) {
      const completion = await getCompletions({
        openAiClient,
        ...clientConfig,
        messages,
        response: { ...response, schema: responseSchema },
        numCompletions: 1,
      });
      const responseMessage = completion.choices[0].message;

      const children = responseMessage.tool_calls?.[0].function.arguments;

      if (!children) {
        throw new Error("No children returned from completion");
      }
      // Parse the response and extract the items array
      const parsedResponse = JSON.parse(children);
      const parsedItems = responseSchema.parse(parsedResponse).items;

      if (parsedItems.length === 0) {
        throw new Error("No children returned from function call.");
      }

      parsedChildren.push(...parsedItems);
      messages.push(responseMessage, {
        role: "user",
        content: `Nice work, now generate ${
          numChildren - parsedChildren.length
        } more children`,
      });
    }
    // Remove extra elements from the parsed children array
    if (parsedChildren.length > numChildren) {
      parsedChildren.splice(numChildren);
    }

    const filteredChildren = await filterChildNodes(
      filterNodes,
      parsedChildren
    );

    return makeChildrenNodes(parent, filteredChildren);
  };
}

export function makeGenerateNChoiceChildrenWithOpenAi<
  ParentNode extends GenerationNode<unknown, string | undefined> | null,
  ChildNode extends WithParentNode<
    GenerationNode<unknown, string | undefined>,
    ParentNode
  >
>({
  makePromptMessages,
  response,
  filterNodes,
}: Omit<
  MakeGenerateChildrenWithOpenAiParams<ParentNode, ChildNode>,
  "response"
> & {
  response: ResponseFunction;
}): GenerateChildren<ParentNode, ChildNode> {
  return async function generateNChoiceChildrenWithOpenAI(
    parent: ParentNode,
    llmOptions: LlmOptions,
    numChildren: number
  ): Promise<ChildNode[]> {
    const messages = await makePromptMessages(parent, numChildren);
    const { openAiClient, ...clientConfig } = llmOptions;

    const completion = await getCompletions({
      openAiClient,
      ...clientConfig,
      messages,
      response,
      numCompletions: numChildren,
    });

    let children: ChildNode["data"][] = completion.choices
      .map((choice) => choice.message.tool_calls?.[0].function.arguments)
      .filter((child): child is string => child !== undefined)
      .map((child) => response.schema.parse(JSON.parse(child)));

    if (children.length === 0) {
      throw new Error("No children returned from completion");
    }
    children = await filterChildNodes(filterNodes, children);
    return makeChildrenNodes(parent, children);
  };
}

async function getCompletions({
  openAiClient,
  messages,
  response,
  numCompletions,
  ...clientConfig
}: LlmOptions & {
  messages: OpenAI.ChatCompletionMessageParam[];
  numCompletions?: number;
  response: ResponseFunction;
}) {
  const completion = await openAiClient.chat.completions.create({
    ...clientConfig,
    messages,
    tool_choice: {
      type: "function",
      function: {
        name: response.name,
      },
    },
    n: numCompletions,
    tools: [
      {
        type: "function",
        function: {
          name: response.name,
          description: response.description,
          parameters: zodToJsonSchema(response.schema, {
            target: "openApi3",
          }),
          strict: true,
        },
      },
    ],
  });
  return completion;
}

async function filterChildNodes<
  ParentNode extends GenerationNode<unknown, string | undefined> | null,
  ChildNode extends WithParentNode<
    GenerationNode<unknown, string | undefined>,
    ParentNode
  >,
  C extends z.ZodTypeAny
>(
  filterNodes: MakeGenerateChildrenWithOpenAiParams<
    ParentNode,
    ChildNode
  >["filterNodes"],
  parsedChildren: z.infer<C>[]
): Promise<z.infer<C>[]> {
  if (filterNodes) {
    const { filter, concurrency = 1 } = filterNodes;
    const { results: filterResults } = await PromisePool.for(parsedChildren)
      .withConcurrency(concurrency)
      .process(async (data) => await filter(data));

    // Filter the original array based on the filter results
    parsedChildren = parsedChildren.filter((_, index) => filterResults[index]);
  }
  return parsedChildren;
}

function makeChildrenNodes<
  ParentNode extends GenerationNode<unknown, string | undefined> | null,
  ChildNode extends WithParentNode<
    GenerationNode<unknown, string | undefined>,
    ParentNode
  >
>(
  parent: ParentNode,
  children: ChildNode["data"][],
  type?: ChildNode["type"]
): ChildNode[] {
  return children.map(
    (child) =>
      ({
        _id: new ObjectId(),
        type,
        parent,
        data: child,
        updated: new Date(),
      } as ChildNode)
  );
}
