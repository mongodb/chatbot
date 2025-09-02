import { OpenAI } from "mongodb-rag-core/openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { PromisePool } from "@supercharge/promise-pool";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { GenerationNode, WithParentNode } from "./GenerationNode";
import { LlmOptions } from "mongodb-rag-core/executeCode";

export type GenerateChildrenLlmOptions = LlmOptions & {
  __claudeMaxConcurrency?: number;
  __claudeTemperatureVariation?: number;
};

export type GenerateChildren<
  ParentNode extends GenerationNode<unknown, string | undefined> | null,
  ChildNode extends WithParentNode<
    GenerationNode<unknown, string | undefined>,
    ParentNode
  >
> = (
  parent: ParentNode,
  llmOptions: GenerateChildrenLlmOptions,
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
  openAiClient: OpenAI;

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
  childType,
  openAiClient,
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
    const { ...clientConfig } = llmOptions;

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
      const toolCall = responseMessage.tool_calls?.[0];
      if (!toolCall || toolCall.type !== "function") {
        throw new Error("No function call in response from OpenAI");
      }

      const children = toolCall.function.arguments;

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

    return makeChildrenNodes(parent, filteredChildren, childType);
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
  childType,
  openAiClient,
}: Omit<
  MakeGenerateChildrenWithOpenAiParams<ParentNode, ChildNode>,
  "response"
> & {
  response: ResponseFunction;
}): GenerateChildren<ParentNode, ChildNode> {
  return async function generateNChoiceChildrenWithOpenAI(
    parent,
    llmOptions,
    numChildren
  ): Promise<ChildNode[]> {
    const messages = await makePromptMessages(parent, numChildren);
    const { ...clientConfig } = llmOptions;
    let completion: OpenAI.Chat.Completions.ChatCompletion & {
      _request_id?: string | null;
    } = {
      choices: [],
      id: "",
      created: 0,
      model: "",
      object: "chat.completion",
    };
    if (llmOptions.model.includes("claude")) {
      const defaultTemperatureVariation = 0.01;
      const defaultMaxConcurrency = 1;
      const defaultTemperature = llmOptions.temperature ?? 0.5;
      const variedTemperatures = Array.from({ length: numChildren }).map(
        (_, index) => {
          // Offset by the temperature variation in a symmetrical manner
          // E.g. if temperature is .5 and variation is .01,
          // then the temperatures should be .5, .49, .51, .48, .52, etc.
          // This is so we can still use the Braintrust cache.
          const isEven = index % 2 === 0;
          const offset = Math.floor(index / 2) + (isEven ? 0 : 1);
          const claudeVariationOffset =
            llmOptions.__claudeTemperatureVariation ??
            defaultTemperatureVariation;
          const variation = isEven
            ? -offset * claudeVariationOffset
            : offset * claudeVariationOffset;
          return Math.round((variation + defaultTemperature) * 100) / 100;
        }
      );
      const { results: choices } = await PromisePool.for(variedTemperatures)
        .withConcurrency(
          llmOptions.__claudeMaxConcurrency ?? defaultMaxConcurrency
        )
        .handleError((error) => {
          console.error("Error generating children", error);
        })
        .process(async (variedTemperature) => {
          clientConfig.temperature = variedTemperature;
          const {
            choices: [choice],
          } = await getCompletions({
            openAiClient,
            ...clientConfig,
            messages,
            response,
            numCompletions: numChildren,
          });
          return choice;
        });
      completion.choices = choices;
    }
    // For other models where we can generate all completions at once
    // using the N candidates generation pattern (see https://community.openai.com/t/how-does-n-parameter-work-in-chat-completions/288725/2)
    else {
      completion = await getCompletions({
        openAiClient,
        ...clientConfig,
        messages,
        response,
        numCompletions: numChildren,
      });
    }

    let children: ChildNode["data"][] = completion.choices
      .map((choice) => {
        const toolCall = choice.message.tool_calls?.[0];
        if (!toolCall || toolCall.type !== "function") {
          throw new Error("No function call in response from OpenAI");
        }
        return toolCall.function.arguments;
      })
      .filter((child): child is string => child !== undefined)
      .map((child) => response.schema.parse(JSON.parse(child)));

    if (children.length === 0) {
      throw new Error("No children returned from completion");
    }
    children = await filterChildNodes(filterNodes, children);
    return makeChildrenNodes(parent, children, childType);
  };
}

async function getCompletions({
  openAiClient,
  messages,
  response,
  numCompletions,
  __claudeMaxConcurrency,
  __claudeTemperatureVariation,
  ...clientConfig
}: GenerateChildrenLlmOptions & {
  messages: OpenAI.ChatCompletionMessageParam[];
  numCompletions?: number;
  response: ResponseFunction;
  openAiClient: OpenAI;
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
