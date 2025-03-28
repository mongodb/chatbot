import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { GenerationNode } from "./GenerationNode";

export type DbGenerationNode<T> = Omit<
  GenerationNode<T, string | undefined>,
  "parent" | "children"
> & {
  parents: (ObjectId | null)[];
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
      // Use an aggregation pipeline to get the node and all its ancestors in one query
      const result = await collection
        .aggregate<{
          node: Node;
          ancestors: Node[];
        }>([
          // Start with the requested node
          { $match: { _id: nodeId } },

          // Store it as our main node
          {
            $project: {
              node: "$$ROOT",
            },
          },

          // Unwind the parents array to get individual parent IDs
          {
            $unwind: {
              path: "$node.parents",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Look up all parent documents
          {
            $lookup: {
              from: collectionName,
              localField: "node.parents",
              foreignField: "_id",
              as: "ancestors",
            },
          },

          // Group everything back together
          {
            $group: {
              _id: "$node._id",
              node: { $first: "$node" },
              ancestors: { $push: "$ancestors" },
            },
          },

          // Flatten the ancestors array
          {
            $project: {
              node: 1,
              ancestors: {
                $reduce: {
                  input: "$ancestors",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this"] },
                },
              },
            },
          },
        ])
        .toArray();

      if (result.length === 0) {
        return null;
      }

      // Build the hierarchy and return the node with its parent chain
      return this.buildNodeHierarchy(result[0].node, result[0].ancestors);
    },

    async updateNode<Node extends GenerationNode<unknown, string | undefined>>(
      nodeId: ObjectId,
      node: Node
    ) {
      const dbNode = convertGenerationNodeToDbNode(node);
      await collection.updateOne({ _id: nodeId }, { $set: dbNode });
    },

    /**
      Builds a node hierarchy by connecting nodes with their parents.
     */
    buildNodeHierarchy<
      Node extends GenerationNode<unknown, string | undefined>
    >(node: Node, ancestors: Node[]): Node {
      if (!ancestors.length) {
        return node;
      }

      // Create a map of nodes by ID for quick lookup
      const nodeMap = new Map<string, Node>();
      for (const ancestor of ancestors) {
        nodeMap.set(ancestor._id.toString(), { ...ancestor });
      }

      // Start with a copy of the original node
      const resultNode = { ...node };

      // Build the parent chain
      let currentNode = resultNode;

      // Get the immediate parent ID
      let parentId = currentNode.parent as unknown as ObjectId;

      while (parentId) {
        const parentIdStr = parentId.toString();
        const parentNode = nodeMap.get(parentIdStr);

        if (!parentNode) {
          break;
        }

        // Set this ancestor as the current node's parent
        currentNode.parent = parentNode as Node["parent"];

        // Move up the chain
        currentNode = parentNode;
        parentId = currentNode.parent as unknown as ObjectId;
      }

      return resultNode;
    },
  };
}

export function convertGenerationNodeToDbNode<T>(
  node: GenerationNode<T, string | undefined>
): DbGenerationNode<T> {
  const parents: (ObjectId | null)[] = [];
  let parent: typeof node.parent | null | undefined = node.parent;
  do {
    parents.push(parent?._id ?? null);
    parent = parent?.parent;
  } while (parent);
  const dbNode = {
    ...node,
    parents,
    children: node.children?.map((child) => child._id),
  };
  // Remove the children field if there are no children
  // So it's not populated in MongoDB as `children: null`
  if (dbNode.children?.length === 0 || !dbNode.children) {
    delete dbNode.children;
  }
  return dbNode;
}
