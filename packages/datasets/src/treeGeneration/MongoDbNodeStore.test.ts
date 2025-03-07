import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { makeMongoDbNodeStore } from "./MongoDbNodeStore";
import { GenerationNode } from "./GenerationNode";
import { MONGO_MEMORY_SERVER_URI } from "../test/constants";

describe("MongoDbNodeStore", () => {
  let nodeStore: ReturnType<typeof makeMongoDbNodeStore>;
  const dbName = "test_db";
  const collectionName = "nodes";
  const mongoClient = new MongoClient(MONGO_MEMORY_SERVER_URI);

  beforeAll(async () => {
    // Create the node store
    nodeStore = makeMongoDbNodeStore({
      mongoClient,
      databaseName: dbName,
      collectionName,
    });

    await nodeStore.connect();
  });

  afterAll(async () => {
    await nodeStore.close();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await mongoClient.db(dbName).collection(collectionName).deleteMany({});
  });

  type Node = GenerationNode<{ name: string }>;
  // Create sample nodes
  const rootNode: Node = {
    _id: new ObjectId(),
    parent: null,
    data: { name: "Root" },
    updated: new Date(),
  };

  const childNode: Node = {
    _id: new ObjectId(),
    parent: rootNode,
    data: { name: "Child" },
    updated: new Date(),
  };

  const grandchildNode: Node = {
    _id: new ObjectId(),
    parent: childNode,
    data: { name: "Grandchild" },
    updated: new Date(),
  };
  it("should store nodes to MongoDB", async () => {
    // Persist nodes
    const result = await nodeStore.storeNodes({
      nodes: [rootNode, childNode, grandchildNode],
    });

    // Check result
    expect(result.insertedCount).toBe(3);

    // Verify nodes were inserted correctly
    const collection = mongoClient.db(dbName).collection(collectionName);
    const count = await collection.countDocuments();
    expect(count).toBe(3);

    // Check that parent references are stored as ObjectIds
    const dbChildNode = await collection.findOne({ _id: childNode._id });
    expect(dbChildNode).toBeTruthy();
    expect(dbChildNode?.parent).toEqual(rootNode._id);

    const dbGrandchildNode = await collection.findOne({
      _id: grandchildNode._id,
    });
    expect(dbGrandchildNode).toBeTruthy();
    expect(dbGrandchildNode?.parent).toEqual(childNode._id);
  });

  it("should retrieve a node with its parent hierarchy", async () => {
    // Create and persist a hierarchy of nodes
    const rootNode: GenerationNode<{ name: string }> = {
      _id: new ObjectId(),
      parent: null,
      data: { name: "Root" },
      updated: new Date(),
    };

    const childNode: GenerationNode<{ name: string }> = {
      _id: new ObjectId(),
      parent: rootNode,
      data: { name: "Child" },
      updated: new Date(),
    };

    const grandchildNode: GenerationNode<{ name: string }> = {
      _id: new ObjectId(),
      parent: childNode,
      data: { name: "Grandchild" },
      updated: new Date(),
    };

    await nodeStore.storeNodes({
      nodes: [rootNode, childNode, grandchildNode],
    });

    // Retrieve the grandchild node
    const retrievedNode = await nodeStore.retrieveNode<Node>(
      grandchildNode._id
    );

    // Verify the node and its parent hierarchy
    expect(retrievedNode).toBeTruthy();
    expect(retrievedNode?._id).toEqual(grandchildNode._id);
    expect(retrievedNode?.data.name).toBe("Grandchild");

    // Check that parent is properly embedded
    expect(retrievedNode?.parent).toBeTruthy();
    expect((retrievedNode?.parent as Node)._id).toEqual(childNode._id);
    expect((retrievedNode?.parent as Node).data.name).toBe("Child");

    // Check that grandparent is properly embedded
    expect((retrievedNode?.parent as Node).parent).toBeTruthy();
    expect(((retrievedNode?.parent as Node).parent as Node)._id).toEqual(
      rootNode._id
    );
    expect(((retrievedNode?.parent as Node).parent as Node).data.name).toBe(
      "Root"
    );

    // Check that the root's parent is null
    expect(((retrievedNode?.parent as Node).parent as Node).parent).toBeNull();
  });

  it("should return null when node does not exist", async () => {
    const nonExistentId = new ObjectId();
    const result = await nodeStore.retrieveNode(nonExistentId);
    expect(result).toBeNull();
  });
});
