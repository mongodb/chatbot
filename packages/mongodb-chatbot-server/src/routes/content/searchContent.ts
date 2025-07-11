import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { ParamsDictionary } from "express-serve-static-core";
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
import { SearchContentCustomData, SearchContentRouterLocals } from "./contentRouter";
import { AddCustomDataFunc } from "../../processors";

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
  addCustomData?: AddCustomDataFunc;
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
  addCustomData
}: MakeSearchContentRouteParams) {
  return async (
    req: ExpressRequest<ParamsDictionary>,
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
      
      const customData = await getCustomData(req, res, addCustomData);
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
      title: metadata?.pageTitle ?? "",
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

  return {
    ...(sourceNames.length && { sourceName: sourceNames }),
    ...(sourceTypes.length && { sourceType: sourceTypes }),
    ...(versionLabels.length && { version: { label: versionLabels } }),
  };
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


async function getCustomData(
  req: ExpressRequest<ParamsDictionary>,
  res: ExpressResponse<SearchContentResponseBody, SearchContentRouterLocals>,
  addCustomData?: AddCustomDataFunc
): Promise<SearchContentCustomData | undefined> {
  try {
    if (addCustomData) {
      return await addCustomData(req, res);
    }
  } catch (error) {
    throw makeRequestError({
      message: "Error parsing custom data from the request",
      stack: (error as Error).stack,
      httpStatus: 500,
    });
  }
}
