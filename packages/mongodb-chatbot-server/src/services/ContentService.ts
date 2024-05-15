import {
  DataSourceOverview,
  EmbeddedContent,
  EmbeddedContentStore,
  Embedder,
  PageStore,
  PersistedPage,
} from "mongodb-rag-core";

export interface ContentService {
  search(params: SearchParams): Promise<ContentResource[]>;
  getAllDataSources(): Promise<DataSourceOverview[]>;
  getDataSource(
    params: GetDataSourceParams
  ): Promise<DataSourceOverview | undefined>;
  getContentResources(params: GeneralParams): Promise<ContentResource[]>;
  getMetadataTypes(): MetadataType[];
}

interface GeneralParams {
  dataSources?: string[];
  format?: string;
  lastUpdated?: Date;
  limit?: number;
  offset?: number;
  contentTypes?: {
    type: string;
    value: string;
  }[];
}

interface SearchParams extends GeneralParams {
  query: string;
}

interface GetContentResourcesParams extends GeneralParams {
  uris?: string[];
}

export interface GetDataSourceParams {
  name: string;
}

export interface ContentResource {
  content: string;
  dataSource: string;
  uri: string;
  format: string;
  lastUpdated: Date;
  metadata?: Record<string, unknown>;
}

export interface MetadataType {
  /**
    Name of the metadata.
   */
  name: string;
  /**
    Data type of the metadata.
   */
  type: string;
  /**
    Description of the metadata.
   */
  description?: string;
}

export interface MakeContentServiceParams {
  pagesStore: PageStore;
  // TODO: this needs more thought..something with zod i think
  metadataFilters: Record<string, unknown>;
  search: {
    embeddedContentStore: EmbeddedContentStore;
    emedder: Embedder;
    // TODO: for the real, there'd be more. some kind of preprocessor, for example
    // Also post-processors, etc.
  };
  embedder: Embedder;
}
export const makeContentService = ({
  pagesStore,
  metadataFilters,
  search,
}: MakeContentServiceParams): ContentService => {
  return {
    search: async ({
      query,
      contentTypes,
      dataSources,
      format,
      lastUpdated,
      limit,
      offset,
    }: SearchParams) => {
      // TODO: preprocess query with LLM/whatever
      const { embedding: queryEmbedding } = await search.emedder.embed({
        text: query,
      });
      const queryResults =
        await search.embeddedContentStore.findNearestNeighbors(
          queryEmbedding
          // TODO: pass additional args
        );
      // maybe TODO: rerank/post-process results
      return queryResults.map(convertEmbeddedContentToContentResource);
    },
    getAllDataSources: async () => {
      const dataSources = await pagesStore.listDataSources();
      return dataSources;
    },
    getDataSource: async ({ name }: GetDataSourceParams) => {
      const [dataSource] = await pagesStore.listDataSources([name]);
      if (!dataSource) {
        throw new Error(`Data source ${name} not found`);
      }
      return dataSource;
    },
    getContentResources: async (params: GetContentResourcesParams) => {
      // TODO: get other types. format, limit, offset, etc
      const pagesMatchingQuery = await pagesStore.loadPages({
        updated: params.lastUpdated,
        sources: params.dataSources,
        urls: params.uris,
      });
      return pagesMatchingQuery.map(convertPageToContentResource);
    },
    getMetadataTypes: () => {
      // TODO: make work
      return [];
    },
  } satisfies ContentService;
};

function convertEmbeddedContentToContentResource(
  embeddedContent: EmbeddedContent
): ContentResource {
  return {
    content: embeddedContent.text,
    dataSource: embeddedContent.sourceName,
    format: (embeddedContent?.metadata?.format as string) ?? "text",
    lastUpdated: embeddedContent.updated,
    metadata: embeddedContent.metadata,
    uri: embeddedContent.url,
  };
}

function convertPageToContentResource(page: PersistedPage): ContentResource {
  return {
    content: page.body,
    dataSource: page.sourceName,
    format: page.format,
    lastUpdated: page.updated,
    metadata: page.metadata,
    uri: page.url,
  };
}
