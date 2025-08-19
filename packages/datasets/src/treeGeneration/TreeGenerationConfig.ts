import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { GenerateChildren } from "./generateChildren";
import { GenerationNode, WithParentNode } from "./GenerationNode";
import { makeMongoDbNodeStore } from "./MongoDbNodeStore";
import {
  DatabaseInfoNode,
  DatabaseUserNode,
} from "./databaseNlQueries/databaseNodes/nodeTypes";
import { logger } from "mongodb-rag-core";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { PromisePool } from "@supercharge/promise-pool";

// Type aliases for better readability
type AnyGenerationNode = GenerationNode<unknown, string | undefined>;

// Tree-based generation step that naturally enforces parent-child relationships
type GenerationTreeStep<
  ParentNode extends AnyGenerationNode | null,
  ChildNode extends WithParentNode<AnyGenerationNode, ParentNode>,
  Children extends
    | GenerationTreeStep<
        ChildNode,
        WithParentNode<AnyGenerationNode, ChildNode>,
        any
      >
    | undefined = undefined,
  TransformedChildNode extends Record<string, unknown> = Record<string, unknown>
> = {
  name: string;
  description?: string;
  concurrency?: number;
  numChildren?: number;
  generateChildren: GenerateChildren<ParentNode, ChildNode>;
  children?: Children;
  llmOptions: LlmOptions;
  transformOutput?: (nodes: ChildNode[]) => Promise<TransformedChildNode[]>;
};

// Root step - must have parent=null
type RootGenerationStep<
  ChildNode extends WithParentNode<AnyGenerationNode, null>,
  Children extends
    | GenerationTreeStep<
        ChildNode,
        WithParentNode<AnyGenerationNode, ChildNode>,
        any
      >
    | undefined = undefined,
  TransformedChildNode extends Record<string, unknown> = Record<string, unknown>
> = GenerationTreeStep<null, ChildNode, Children, TransformedChildNode>;

interface TreeGenerationConfig<
  TRootStep extends RootGenerationStep<
    WithParentNode<AnyGenerationNode, null>,
    any
  > = RootGenerationStep<WithParentNode<AnyGenerationNode, null>, any>
> {
  nodeStore: ReturnType<typeof makeMongoDbNodeStore>;
  /**
    Tree structure where each step naturally enforces parent-child relationships:
    - Root step must have parent=null
    - Each child step's parent type must match its parent step's child type
    - Nesting structure makes invalid chains impossible
   */
  generationTree: TRootStep;
}

// Helper function to create type-safe tree configurations
export function createTreeConfig<
  TRootStep extends RootGenerationStep<
    WithParentNode<AnyGenerationNode, null>,
    any
  >
>(config: TreeGenerationConfig<TRootStep>): TreeGenerationConfig<TRootStep> {
  return config;
}

// Example with properly typed tree structure
export const exampleConfig = createTreeConfig({
  nodeStore: makeMongoDbNodeStore({
    mongoClient: new MongoClient(""),
    databaseName: "example",
    collectionName: "nodes",
  }),
  generationTree: {
    name: "generate-database-info",
    description: "Generate database information (root step)",
    llmOptions: {
      model: "gpt-4o",
      temperature: 0,
    },
    async generateChildren(): Promise<DatabaseInfoNode[]> {
      return [
        {
          _id: new ObjectId(),
          parent: null,
          data: {
            name: "example-db",
            description: "Example database for testing",
            latestDate: new Date(),
            collections: [],
          },
          updated: new Date(),
          type: "database_info" as const,
        },
      ];
    },
    children: {
      name: "generate-users",
      description: "Generate database users",
      llmOptions: {
        model: "gpt-4o",
        temperature: 0,
      },
      generateChildren: async (
        parent: DatabaseInfoNode
      ): Promise<DatabaseUserNode[]> => [
        {
          _id: new ObjectId(),
          parent, // Now properly typed as DatabaseInfoNode!
          data: {
            name: "John Doe",
            role: "Developer",
            description: "Senior developer with 10 years of experience",
          },
          updated: new Date(),
          type: "database_user" as const,
        },
      ],
    },
  },
});

export async function runTreeGeneration<Config extends TreeGenerationConfig>({
  generationTree,
  nodeStore,
}: Config) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function generateRecursiveHelper(
    node: any,
    parent: AnyGenerationNode | null = null
  ): Promise<AnyGenerationNode[]> {
    const children = await node.generateChildren(
      parent,
      node.llmOptions,
      node.numChildren ?? 1
    );
    await nodeStore.storeNodes({ nodes: children });
    logEvent(runId, `Generated ${children.length} children for ${node.name}`);

    if (node.children) {
      // Recurse for each child in parallel with max concurrency
      const { results } = await PromisePool.for(children as AnyGenerationNode[])
        .withConcurrency(node.concurrency ?? 3)
        .handleError((error) => {
          logEvent(
            runId,
            `Error generating children: ${error.message}`,
            "error"
          );
        })
        .process(async (child) => {
          return await generateRecursiveHelper(node.children, child);
        });

      return results.flat();
    }

    // Leaf level - return the generated children
    return children;
  }
  const runId = new ObjectId();
  logger.info({ runId, message: "Starting run" });
  try {
    await nodeStore.connect();
    await generateRecursiveHelper(generationTree);

    logEvent(runId, "Generated root node");
  } catch (error) {
    if (error instanceof Error) {
      logEvent(runId, error.message, "error");
    } else {
      logEvent(runId, `Unknown error: ${error}`, "error");
    }
  } finally {
    await nodeStore.close();
    logEvent(runId, "Closed node store");
    logEvent(runId, "Finished run");
  }
}

function logEvent(
  runId: ObjectId,
  message: string,
  type: "info" | "error" = "info"
) {
  logger[type]({ runId, message, type });
}
