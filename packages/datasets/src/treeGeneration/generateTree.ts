import { OpenAI } from "mongodb-rag-core/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { PromisePool } from "@supercharge/promise-pool";
import { ObjectId } from "mongodb-rag-core/mongodb";

export interface GenerationNode<T> {
  _id: ObjectId;
  parent: GenerationNode<unknown> | null;
  children?: GenerationNode<unknown>[];
  data: T;
  updated: Date;
}

export type DbGenerationNode<T> = Omit<
  GenerationNode<T>,
  "parent" | "children"
> & {
  parent: ObjectId | null;
  children?: ObjectId[];
};

export function convertGenerationNodeToDbNode<T>(
  node: GenerationNode<T>
): DbGenerationNode<T> {
  const dbNode = {
    ...node,
    parent: node.parent?._id ?? null,
    children: node.children?.map((child) => child._id),
  };
  // Remove the children field if there are no children
  // So it's not populated in MongoDB as `children: null`
  if (dbNode.children?.length === 0 || !dbNode.children) {
    delete dbNode.children;
  }
  return dbNode;
}

export type GenerateChildren<
  ParentNode extends GenerationNode<unknown> | null,
  ChildNode extends GenerationNode<unknown> & {
    parent: ParentNode;
  }
> = (parent: ParentNode) => Promise<ChildNode[]>;

export interface MakeGenerateChildrenWithOpenAiParams<
  ParentNode extends GenerationNode<unknown> | null,
  ChildDataSchema extends z.ZodTypeAny
> {
  /**
    Function that generates a prompt for a parent node.
    */
  makePromptMessages: (
    parentNode: ParentNode
  ) => Promise<OpenAI.ChatCompletionMessageParam[]>;
  openAiClient: OpenAI;
  clientConfig: Omit<
    OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
    "messages" | "tools" | "tool_choice"
  >;

  /**
    Information on what the elements of the response should look like.
   */
  response: {
    /**
      Name of the response.
     */
    name: string;

    /**
      Short description of the response.
     */

    description?: string;
    /** 
      The schema of the response. Includes the schema of the children.
      Can also include array options like min/max length, refinements, etc.
     */
    schema: z.ZodArray<ChildDataSchema>;
  };

  /**
    Filter child nodes out of the response
   */
  filterNodes?: {
    filter: (node: z.infer<ChildDataSchema>) => Promise<boolean>;
    /**
      @default 1
     */
    concurrency?: number;
  };
}

export type WithParentNode<
  Node extends GenerationNode<unknown>,
  ParentNode extends GenerationNode<unknown> | null
> = Node & {
  parent: ParentNode;
};

export function makeGenerateChildrenWithOpenAi<
  ParentNode extends GenerationNode<unknown> | null,
  ChildData
>({
  makePromptMessages,
  openAiClient,
  clientConfig,
  response,
  filterNodes,
}: Omit<MakeGenerateChildrenWithOpenAiParams<ParentNode, any>, "response"> & {
  response: {
    name: string;
    description?: string;
    schema: z.ZodType<ChildData[]>;
  };
  filterNodes?: {
    filter: (data: ChildData) => Promise<boolean>;
    concurrency?: number;
  };
}): GenerateChildren<
  ParentNode,
  WithParentNode<GenerationNode<ChildData>, ParentNode>
> {
  return async function generateChildrenWithOpenAI(
    parent: ParentNode
  ): Promise<Array<WithParentNode<GenerationNode<ChildData>, ParentNode>>> {
    const messages = await makePromptMessages(parent);

    const completion = await openAiClient.chat.completions.create({
      ...clientConfig,
      messages,
      tool_choice: {
        type: "function",
        function: {
          name: response.name,
        },
      },
      tools: [
        {
          type: "function",
          function: {
            name: response.name,
            description: response.description,
            parameters: zodToJsonSchema(
              z.object({
                items: response.schema,
              }),
              {
                target: "openApi3",
              }
            ),
            strict: true,
          },
        },
      ],
    });
    const children =
      completion.choices[0].message.tool_calls?.[0].function.arguments;

    if (!children) {
      throw new Error("No children returned from completion");
    }
    // Parse the response and extract the items array
    const parsedResponse = JSON.parse(children);
    const itemsArray = parsedResponse.items || parsedResponse;
    let parsedChildren = response.schema.parse(itemsArray);
    if (!parsedChildren) {
      throw new Error("Failed to parse children");
    }

    if (filterNodes) {
      const { filter, concurrency = 1 } = filterNodes;
      const { results: filterResults } = await PromisePool.for(parsedChildren)
        .withConcurrency(concurrency)
        .process(async (data) => await filter(data));

      // Filter the original array based on the filter results
      parsedChildren = parsedChildren.filter(
        (_, index) => filterResults[index]
      );
    }
    const nodes = parsedChildren.map((data) => ({
      _id: new ObjectId(),
      parent,
      data,
      updated: new Date(),
    }));

    return nodes;
  };
}
