import {
  FindContentFunc,
  FindContentResult,
  MongoDbSearchResultsStore,
  QueryFilters,
  SearchRecordDataSource,
  SearchRecordDataSourceSchema,
} from "mongodb-rag-core";
import { SomeExpressRequest } from "../../middleware";
import { z } from "zod";
import { ConversationsRouterLocals } from "../conversations";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

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
  metadata: {
    sourceName: string;
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
    res: ExpressResponse<SearchContentResponseBody, ConversationsRouterLocals>
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
      // TODO: error handling
    }
  };
}

// TODO: map FindContentResult to SearchContentResponseChunk
function mapFindContentResultToSearchContentResponseChunk(
  result: FindContentResult
): SearchContentResponseBody {
  // TODO:
  return {
    results: [],
  };
}

function mapDataSourcesToFilters(
  dataSources: SearchRecordDataSource[]
): QueryFilters {
  // TODO: implement
  return {};
}

async function persistSearchResultsToDatabase(params: {
  query: string;
  results: FindContentResult;
  dataSources: SearchRecordDataSource[];
  limit: number;
  searchResultsStore: MongoDbSearchResultsStore;
}) {
  // TODO: implement
}
