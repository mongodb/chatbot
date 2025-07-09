import { makeFindContentWithMongoDbMetadata } from "./config";

// Mocks

jest.mock("mongodb-rag-core/mongoDbMetadata", () => {
  const actual = jest.requireActual("mongodb-rag-core/mongoDbMetadata");
  return {
    ...actual,
    classifyMongoDbProgrammingLanguageAndProduct: jest.fn(),
  };
});

jest.mock("mongodb-rag-core", () => {
  const actual = jest.requireActual("mongodb-rag-core");
  return {
    ...actual,
    updateFrontMatter: jest.fn(),
  };
});

jest.mock("mongodb-rag-core/braintrust", () => {
  const actual = jest.requireActual("mongodb-rag-core/braintrust");
  return {
    ...actual,
    wrapTraced: jest.fn(),
  };
});

import { classifyMongoDbProgrammingLanguageAndProduct } from "mongodb-rag-core/mongoDbMetadata";
import { FindContentFunc, updateFrontMatter } from "mongodb-rag-core";
import { wrapTraced } from "mongodb-rag-core/braintrust";

const mockedClassify =
  classifyMongoDbProgrammingLanguageAndProduct as jest.Mock;
const mockedUpdateFrontMatter = updateFrontMatter as jest.Mock;
const mockedWrapTraced = wrapTraced as jest.Mock;

function makeMockFindContent(result: string[]): FindContentFunc {
  return jest.fn().mockResolvedValue(result);
}

afterEach(() => {
  jest.resetAllMocks();
});

describe("makeFindContentWithMongoDbMetadata", () => {
  test("enhances query with front matter and classification", async () => {
    const inputQuery = "How do I use MongoDB with TypeScript?";
    const expectedQuery = `---
    product: driver
    programmingLanguage: typescript
    ---
    How do I use MongoDB with TypeScript?`;
    const fakeResult = ["doc1", "doc2"];

    mockedClassify.mockResolvedValue({
      product: "driver",
      programmingLanguage: "typescript",
    });
    mockedUpdateFrontMatter.mockReturnValue(expectedQuery);
    mockedWrapTraced.mockImplementation((fn) => fn);

    const findContentMock = makeMockFindContent(fakeResult);

    const wrappedFindContent = makeFindContentWithMongoDbMetadata({
      findContent: findContentMock,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      classifierModel: {} as any,
    });

    const result = await wrappedFindContent({
      query: inputQuery,
      filters: { sourceName: { $in: ["docs"] } },
      limit: 3,
    });

    expect(mockedClassify).toHaveBeenCalledWith(expect.anything(), inputQuery);
    expect(mockedUpdateFrontMatter).toHaveBeenCalledWith(inputQuery, {
      product: "driver",
      programmingLanguage: "typescript",
    });

    expect(findContentMock).toHaveBeenCalledWith({
      query: expectedQuery,
      filters: { sourceName: { $in: ["docs"] } },
      limit: 3,
    });

    expect(result).toEqual(fakeResult);
  });
});
