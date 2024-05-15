import { Router } from "express";
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

  contentRouter.get("/data-sources/:dataSourceName", async (req, res) => {
    const { dataSourceName } = req.params;
    if (typeof dataSourceName !== "string") {
      return res.status(400).json({
        error: "Data source name must be a string",
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
  });

  contentRouter.get("/resources", async (req, res) => {
    // TODO: do it
  });

  return contentRouter;
}
