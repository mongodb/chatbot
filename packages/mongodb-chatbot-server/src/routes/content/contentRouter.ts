import { Router, Request } from "express";
import { ContentService } from "../../services/ContentService";

export interface ContentRouterParams {
  contentService: ContentService;
}

export function makeContentRouter({ contentService }: ContentRouterParams) {
  const contentRouter = Router();

  // TODO: implement routes
  contentRouter.get("/search", async (req, res) => {
    const { query } = req.query;
    if (typeof query !== "string") {
      return res.status(400).json({
        error: "Query must be a string",
      });
    }
    const contentResources = await contentService.search({
      query,
    });
    res.json(contentResources);
  });

  contentRouter.get("/data-sources", async (req, res) => {
    const dataSources = await contentService.getAllDataSources();
    res.json(dataSources);
  });

  contentRouter.get(
    "/data-sources/:dataSourceName/:version",
    async (req, res) => {
      const { dataSourceName, version } = req.params;
      if (typeof dataSourceName !== "string") {
        return res.status(400).json({
          error: "Data source name must be a string",
        });
      }
      // FUTURE_TODO: support versions
      if (version !== "latest") {
        return res.status(400).json({
          error: "Only 'latest' version is currently supported",
        });
      }
      try {
        const dataSource = await contentService.getDataSource({
          name: dataSourceName,
        });
        res.json(dataSource);
      } catch (error) {
        res.status(404).json({
          error: `Data source ${dataSourceName} not found`,
        });
      }
    }
  );

  contentRouter.get(
    "/data-sources/:dataSourceName/:version/resources",
    async (req, res) => {
      const { dataSourceName, version } = req.params;
      if (typeof dataSourceName !== "string") {
        return res.status(400).json({
          error: "Data source name must be a string",
        });
      }
      // FUTURE_TODO: support versions
      if (version !== "latest") {
        return res.status(400).json({
          error: "Only 'latest' version is currently supported",
        });
      }
      try {
        const resources = await contentService.getContentResources({
          dataSources: [dataSourceName],
        });
        res.json(resources);
      } catch (error) {
        res.status(404).json({
          error: `Data source ${dataSourceName} not found`,
        });
      }
    }
  );

  contentRouter.get(
    "/resources",
    async (req: GetContentResourcesRequest, res) => {
      const {
        lastUpdated,
        dataSources,
        format,
        contentTypes,
        limit,
        offset,
        uris,
      } = req.query;
      // TODO: support limit and offset
      if (limit) {
        res.status(400).json({
          error: "Limit not supported yet",
        });
      }
      if (offset) {
        res.status(400).json({
          error: "Offset not supported yet",
        });
      }

      let lastUpdatedDate: Date | undefined;
      if (lastUpdated) {
        try {
          lastUpdatedDate = new Date(parseInt(lastUpdated));
        } catch (error) {
          return res.status(400).json({
            error: "Invalid lastUpdated date",
          });
        }
      }
      // TODO: support query by URLs
      const resources = await contentService.getContentResources({
        dataSources,
        uris,
        lastUpdated: lastUpdatedDate,
        contentTypes,
        format,
      });
      res.json(resources);
    }
  );

  return contentRouter;
}

interface GetContentResourcesRequest extends Request {
  query: {
    dataSources?: string[];
    format?: string;
    contentTypes?: { type: string; value: string }[];
    lastUpdated?: string;
    limit?: string;
    offset?: string;
    uris?: string[];
  };
}
