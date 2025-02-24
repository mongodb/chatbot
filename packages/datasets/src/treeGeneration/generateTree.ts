import { OpenAI } from "mongodb-rag-core/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { PromisePool } from "@supercharge/promise-pool";

export interface GenerationNode<T> {
  parent: GenerationNode<unknown> | null;
  children?: GenerationNode<unknown>[];
  data: T;
}

export type GenerateChildren<
  ParentNode extends GenerationNode<unknown>,
  ChildNode extends GenerationNode<unknown> & {
    parent: ParentNode;
  }
> = (parent: ParentNode) => Promise<ChildNode[]>;

export interface MakeGenerateChildrenWithOpenAiParams<
  ParentNode extends GenerationNode<unknown>,
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
    filter: (
      node: GenerationNode<z.infer<ChildDataSchema>>
    ) => Promise<boolean>;
    /**
      @default 1
     */
    concurrency?: number;
  };
}

type WithParentNode<
  Node extends GenerationNode<unknown>,
  ParentNode extends GenerationNode<unknown>
> = Node & {
  parent: ParentNode;
};

export function makeGenerateChildrenWithOpenAi<
  ParentNode extends GenerationNode<unknown>,
  ChildDataSchema extends z.ZodTypeAny
>({
  makePromptMessages,
  openAiClient,
  clientConfig,
  response,
  filterNodes,
}: MakeGenerateChildrenWithOpenAiParams<
  ParentNode,
  ChildDataSchema
>): GenerateChildren<
  ParentNode,
  WithParentNode<GenerationNode<z.infer<ChildDataSchema>>, ParentNode>
> {
  return async function generateChildrenWithOpenAI(
    parent: ParentNode
  ): Promise<
    Array<WithParentNode<GenerationNode<z.infer<ChildDataSchema>>, ParentNode>>
  > {
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
            parameters: zodToJsonSchema(response.schema, {
              target: "openApi3",
            }),
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
    let parsedChildren = response.schema.parse(JSON.parse(children));
    if (!parsedChildren) {
      throw new Error("Failed to parse children");
    }

    if (filterNodes) {
      const { filter, concurrency = 1 } = filterNodes;
      const { results: trimmedChildren } = await PromisePool.for(parsedChildren)
        .withConcurrency(concurrency)
        .process(filter);
      parsedChildren = trimmedChildren;
    }
    const nodes = parsedChildren.map((data) => ({
      parent,
      children: undefined,
      data,
    }));

    return nodes;
  };
}
