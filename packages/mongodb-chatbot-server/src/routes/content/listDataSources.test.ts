import type {
  MongoDbEmbeddedContentStore,
  DataSourceMetadata,
} from "mongodb-rag-core";
import { createRequest, createResponse } from "node-mocks-http";
import { ERROR_MESSAGES, makeListDataSourcesRoute } from "./listDataSources";

function makeMockEmbeddedContentStore(dataSources: DataSourceMetadata[]) {
  return {
    listDataSources: jest.fn().mockResolvedValue(dataSources),
  } as unknown as MongoDbEmbeddedContentStore;
}

describe("makeListDataSourcesRoute", () => {
  const mockDataSources: DataSourceMetadata[] = [
    {
      id: "source1",
      versions: [
        { label: "current", isCurrent: true },
        { label: "v6.0", isCurrent: false },
      ],
      type: "docs",
    },
    {
      id: "source2",
      versions: [{ label: "v2.11", isCurrent: false }],
      type: "university-content",
    },
  ];

  it("should return data sources for a valid request", async () => {
    const embeddedContentStore = makeMockEmbeddedContentStore(mockDataSources);
    const handler = makeListDataSourcesRoute({ embeddedContentStore });

    const req = createRequest({
      headers: { "req-id": "test-req-id" },
    });
    const res = createResponse();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handler(req, res as any);

    const data = res._getJSONData();
    expect(data).toHaveProperty("dataSources");
    expect(Array.isArray(data.dataSources)).toBe(true);
    expect(data.dataSources.length).toBe(2);
    expect(data.dataSources[0].id).toBe("source1");
  });

  it("should handle errors from embeddedContentStore and throw", async () => {
    const embeddedContentStore = {
      listDataSources: jest.fn().mockRejectedValue(new Error("fail")),
    } as unknown as MongoDbEmbeddedContentStore;
    const handler = makeListDataSourcesRoute({ embeddedContentStore });

    const req = createRequest({
      headers: { "req-id": "test-req-id" },
    });
    const res = createResponse();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(handler(req, res as any)).rejects.toMatchObject({
      message: ERROR_MESSAGES.UNABLE_TO_LIST_DATA_SOURCES,
      httpStatus: 500,
      name: "RequestError",
    });
  });

  it("should return an empty array if no data sources are found", async () => {
    const embeddedContentStore = makeMockEmbeddedContentStore([]);
    const handler = makeListDataSourcesRoute({ embeddedContentStore });

    const req = createRequest({
      headers: { "req-id": "test-req-id" },
    });
    const res = createResponse();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handler(req, res as any);

    const data = res._getJSONData();
    expect(data).toHaveProperty("dataSources");
    expect(Array.isArray(data.dataSources)).toBe(true);
    expect(data.dataSources.length).toBe(0);
  });
});
