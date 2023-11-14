import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
  Express,
} from "express";
import { getRequestId, logRequest } from "../../utils";
import { FindContentFunc } from "../conversations";
import { stripIndents } from "common-tags";
import yaml from "yaml";


export interface FetchDataRouteParams {
  findContent: FindContentFunc;
  app: Express;
  middleware?: any[];
}

export function makeFetchDataRoute({
  findContent,
}: FetchDataRouteParams) {
  return async (
    req: ExpressRequest & { ip?: string, query: {q: string} },
    res: ExpressResponse,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const { q } = req.query;
      logRequest({
        reqId,
        message: stripIndents`Request info:
          Search query: ${q}`,
      });
      const searchQuery = yaml.stringify(q)
      const {content} = await findContent({query: searchQuery, ipAddress: req.ip ?? ""});
      const cleanedContent = content.map(({url, text}) => ({url, text}))
      const response = {
        data: {
          instructions: `Use this \`content\` to inform your response to the user.
When using this information in your response, cite the source by including the \`url\` in Markdown formatted citations. For example:
Here is text based on the information.[^1]

[^1]: https://example-url.com`,
          content: cleanedContent,
        }
      }
      res.status(200).json(response);

    } catch (err) {
      next(err);
    }
  };
}
