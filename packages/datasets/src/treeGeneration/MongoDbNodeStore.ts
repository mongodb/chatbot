import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { GenerationNode } from "./GenerationNode";

export type DbGenerationNode<T> = Omit<
  GenerationNode<T, string | undefined>,
  "parent" | "children"
> & {
  parent: ObjectId | null;
  children?: ObjectId[];
};

export interface MakeMongoDbNodeStoreParams {
  mongoClient: MongoClient;
  databaseName: string;
  collectionName: string;
}

export function makeMongoDbNodeStore({
  mongoClient,
  databaseName,
  collectionName,
}: MakeMongoDbNodeStoreParams) {
  const db = mongoClient.db(databaseName);
  const collection = db.collection(collectionName);
  return {
    async connect() {
      await mongoClient.connect();
    },
    async close() {
      await mongoClient.close();
    },
    async storeNodes({
      nodes,
    }: {
      nodes: GenerationNode<unknown, string | undefined>[];
    }) {
      const dbNodes = nodes.map(convertGenerationNodeToDbNode);
      const res = await collection.insertMany(dbNodes);
      return res;
    },
    async retrieveNode<
      Node extends GenerationNode<unknown, string | undefined>
    >(nodeId: ObjectId) {
      // Use $graphLookup to get the node and all its parents in one query
      const result = await collection
        .aggregate<{
          node: Node;
          parents: Node[];
        }>([
          // Start with the requested node
          { $match: { _id: nodeId } },

          // Get the node itself
          { $project: { node: "$$ROOT" } },

          // Use $graphLookup to get all parent nodes
          {
            $graphLookup: {
              from: collectionName,
              startWith: "$node.parent",
              connectFromField: "parent",
              connectToField: "_id",
              as: "parents",
              depthField: "depth",
            },
          },

          // Sort parents by depth (child first)
          {
            $addFields: {
              parents: {
                $sortArray: { input: "$parents", sortBy: { depth: 1 } },
              },
            },
          },
        ])
        .toArray();

      if (result.length === 0) {
        return null;
      }

      const { node, parents } = result[0];

      // Create a map of parent nodes by ID for quick lookup
      const parentMap = new Map<string, Node>();
      for (const parent of parents) {
        parentMap.set(parent._id.toString(), parent);
      }

      // Function to recursively build the parent hierarchy
      const buildParentHierarchy = (nodeWithParent: Node): Node => {
        if (!nodeWithParent.parent) return nodeWithParent;

        const parentId = (
          nodeWithParent.parent as unknown as ObjectId
        ).toString();
        const parentNode = parentMap.get(parentId);

        if (parentNode) {
          // Create a copy of the parent node to avoid circular references
          const parentNodeCopy = { ...parentNode };
          // Recursively build the parent's parent hierarchy
          nodeWithParent.parent = buildParentHierarchy(parentNodeCopy) as any;
        }

        return nodeWithParent;
      };

      // Build the complete hierarchy and return
      return buildParentHierarchy(node) as Node;
    },

    async updateNode<Node extends GenerationNode<unknown, string | undefined>>(
      nodeId: ObjectId,
      node: Node
    ) {
      const dbNode = convertGenerationNodeToDbNode(node);
      await collection.updateOne({ _id: nodeId }, { $set: dbNode });
    },
  };
}

export function convertGenerationNodeToDbNode<T>(
  node: GenerationNode<T, string | undefined>
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
