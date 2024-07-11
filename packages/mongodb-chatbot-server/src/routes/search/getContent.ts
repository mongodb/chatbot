import { EmbeddedContent } from "mongodb-rag-core";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { SomeExpressRequest } from "../../middleware";
import { z } from "zod";
import { strict as assert } from "assert";
import { SearchFunc, SearchResult } from "../../services/Search";

export interface GetContentParams {
  maxLimit?: number;
  defaultLimit?: number;
  minLimit?: number;
  maxOffset?: number;
  search: SearchFunc;
}

export const AddMessageRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    query: z.object({
      q: z.string(),
      limit: z.string().optional(),
      offset: z.string().optional(),
    }),
  })
);

export type AddMessageRequest = z.infer<typeof AddMessageRequest>;
export interface GetContentResponse {
  offset: number;
  limit: number;
  results: SearchResult[];
}

export type ConvertEmbeddedContentToSearchResults = (
  content: EmbeddedContent[]
) => Promise<SearchResult>;

export function makeGetContentRoute({
  maxLimit = 100,
  defaultLimit = 5,
  minLimit = 1,
  maxOffset = 0,
  search,
}: GetContentParams) {
  assert(minLimit >= 1, `minLimit must be >= 1. Got: ${minLimit}`);
  return async (
    req: ExpressRequest<AddMessageRequest["params"]>,
    res: ExpressResponse<GetContentResponse[]>
  ) => {
    try {
      // TODO: validate request. throw 400 if invalid
      // take into account limit and offset in validations
      // perform search
      // return search results
    } catch (err) {
      // TODO: handle errs...borrow logic from conversations
    }
  };
}
