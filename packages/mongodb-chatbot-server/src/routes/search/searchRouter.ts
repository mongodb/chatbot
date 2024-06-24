import { RequestHandler, Router } from "express";
import { GetContentParams, makeGetContentRoute } from "./getContent";

export interface SearchRouterParams {
  getContentConfig: GetContentParams;
  middleware?: RequestHandler[];
}

export function makeSearchRouter({
  getContentConfig,
  middleware = [],
}: SearchRouterParams) {
  const searchRouter = Router();
  middleware.forEach((middleware) => searchRouter.use(middleware));
  searchRouter.get("/", makeGetContentRoute(getContentConfig));
}
