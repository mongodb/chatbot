import { jest } from "@jest/globals";
import { generateDatabaseExecutionResult } from "./generateDatabaseExecutionResult";
import { ObjectId } from "mongodb-rag-core/mongodb";

import {
  DatabaseInfoNode,
  DatabaseUserNode,
  DatabaseUseCaseSchema,
} from "./nodeTypes";
import {
  sampleMovieDbInfo,
  sampleDatabaseUsers,
  sampleUseCases,
  sampleNlQueries,
} from "./sampleData";
import { DatabaseExecutionResult } from "mongodb-rag-core/executeCode";

jest.setTimeout(1000 * 60);

// Skipping LLM call tests
describe.skip("generateDatabaseExecutionResults", () => {
  // Create a parent node with the database info
  const databaseInfoNode: DatabaseInfoNode = {
    _id: new ObjectId(),
    parent: null,
    data: sampleMovieDbInfo,
    updated: new Date(),
  };

  // Get a sample user and their use cases
  const sampleUser = sampleDatabaseUsers[0]; // Alice Chen
  const userUseCases = sampleUseCases[sampleUser.name];

  // Create a user node with the parent reference
  const userNode: DatabaseUserNode = {
    _id: new ObjectId(),
    parent: databaseInfoNode,
    data: sampleUser,
    updated: new Date(),
  };

  const useCaseNodes = userUseCases.map((useCase) => ({
    _id: new ObjectId(),
    parent: userNode,
    data: DatabaseUseCaseSchema.parse(useCase),
    updated: new Date(),
  }));

  const nlQueryNode = Object.entries(sampleNlQueries["Alice Chen"]).flatMap(
    ([useCaseTitle, nlQueries]) =>
      nlQueries.map((nlQuery) => ({
        _id: new ObjectId(),
        parent: useCaseNodes.find(
          (useCase) => useCase.data.title === useCaseTitle
        )!,
        data: nlQuery,
        updated: new Date(),
      }))
  )[0];
  it("should generate database execution result node", async () => {
    const executionResult = {
      executionTimeMs: 0,
      result: 1,
    } satisfies DatabaseExecutionResult;
    const res = await generateDatabaseExecutionResult({
      generatedQuery: {
        _id: new ObjectId(),
        data: {
          code: "db.users.find({ age: { $gt: 25 } })",
          language: "mongodb",
          queryPlan: "whateva",
        },
        parent: nlQueryNode,
        updated: new Date(),
      },
      database: {
        uri: "not a real uri",
        name: "whateva",
      },
      executor: async () => {
        return executionResult;
      },
    });

    expect(res).toMatchObject({
      _id: expect.any(ObjectId),
      updated: expect.any(Date),
      data: executionResult,
    });
  });
});
