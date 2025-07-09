import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import {
  FindContentFunc,
  FindContentResult,
  MongoDbSearchResultsStore,
  QueryFilters,
  SearchRecordDataSource,
  SearchRecordDataSourceSchema,
} from "mongodb-rag-core";
import { z } from "zod";

import { SomeExpressRequest } from "../../middleware";
import { makeRequestError } from "../conversations/utils";
import { SearchContentRouterLocals } from "./contentRouter";

export const SearchContentRequestBody = z.object({
  query: z.string(),
  dataSources: z.array(SearchRecordDataSourceSchema).optional(),
  limit: z.number().int().min(1).max(500).optional().default(5),
});

export const SearchContentRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    body: SearchContentRequestBody,
  })
);

export type SearchContentRequest = z.infer<typeof SearchContentRequest>;
export type SearchContentRequestBody = z.infer<typeof SearchContentRequestBody>;

export interface MakeSearchContentRouteParams {
  findContent: FindContentFunc;
  searchResultsStore: MongoDbSearchResultsStore;
}

interface SearchContentResponseChunk {
  url: string;
  title: string;
  text: string;
  metadata?: {
    sourceName?: string;
    sourceType?: string;
    sourceVersionLabel?: string;
    tags?: string[];
    [k: string]: unknown;
  };
}
interface SearchContentResponseBody {
  results: SearchContentResponseChunk[];
}

export function makeSearchContentRoute({
  findContent,
  searchResultsStore,
}: MakeSearchContentRouteParams) {
  return async (
    req: ExpressRequest<SearchContentRequest["params"]>,
    res: ExpressResponse<SearchContentResponseBody, SearchContentRouterLocals>
  ) => {
    try {
      const { query, dataSources, limit } = req.body;
      const results = await findContent({
        query,
        filters: mapDataSourcesToFilters(dataSources),
        limit,
      });
      res.json(mapFindContentResultToSearchContentResponseChunk(results));
      await persistSearchResultsToDatabase({
        query,
        results,
        dataSources,
        limit,
        searchResultsStore,
      });
    } catch (error) {
      throw makeRequestError({
        httpStatus: 500,
        message: "Unable to query search database",
      });
    }
  };
}

function mapFindContentResultToSearchContentResponseChunk(
  result: FindContentResult
): SearchContentResponseBody {
  return {
    results: result.content.map(({ url, metadata, text }) => ({
      url,
      title: metadata?.pageTitle || "",
      text,
      metadata,
    })),
  };
}

function mapDataSourcesToFilters(
  dataSources?: SearchRecordDataSource[]
): QueryFilters {
  if (!dataSources || dataSources.length === 0) {
    return {};
  }

  const sourceNames = dataSources.map((ds) => ds.name);
  const sourceTypes = dataSources
    .map((ds) => ds.type)
    .filter((t): t is string => !!t);
  const versionLabels = dataSources
    .map((ds) => ds.versionLabel)
    .filter((v): v is string => !!v);

  const filter: QueryFilters = {};

  if (sourceNames.length) {
    filter.sourceName = { $in: sourceNames };
  }
  if (sourceTypes.length) {
    filter.sourceType = { $in: sourceTypes };
  }
  if (versionLabels.length) {
    filter.version = { label: { $in: versionLabels } };
  }

  return filter;
}

async function persistSearchResultsToDatabase(params: {
  query: string;
  results: FindContentResult;
  dataSources: SearchRecordDataSource[];
  limit: number;
  searchResultsStore: MongoDbSearchResultsStore;
}) {
  params.searchResultsStore.saveSearchResult({
    query: params.query,
    results: params.results.content,
    dataSources: params.dataSources,
    limit: params.limit,
    createdAt: new Date(),
  });
}
