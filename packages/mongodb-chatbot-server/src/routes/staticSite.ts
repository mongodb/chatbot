import express, { Express } from "express";
import path from "path";

/**
  Middleware that serves the static site from the root path
  (`GET https://my-site.com/`).
 */
export function makeStaticSite(app: Express) {
  return app.use(
    "/",
    // servers from <package root>/static
    express.static(path.join(__dirname, "..", "..", "static"))
  );
}
