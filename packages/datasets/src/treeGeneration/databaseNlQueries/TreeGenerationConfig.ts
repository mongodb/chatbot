import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { GenerateChildren } from "../generateChildren";
import { GenerationNode, WithParentNode } from "../GenerationNode";
import { makeMongoDbNodeStore } from "../MongoDbNodeStore";
import { DatabaseInfoNode, DatabaseUserNode } from "./databaseNodes/nodeTypes";

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
