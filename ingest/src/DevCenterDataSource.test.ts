import { strict as assert } from "assert";
import { makeDevCenterDataSource } from "./DevCenterDataSource";

import "dotenv/config";

describe("DevCenterDataSource", () => {
  jest.setTimeout(20000);
  it("loads pages from dev center", async () => {
    const { DEVCENTER_CONNECTION_URI } = process.env;
    assert(
      DEVCENTER_CONNECTION_URI !== undefined,
      "env var DEVCENTER_CONNECTION_URI not defined. Did you copy .env.example to .env and fill it in?"
    );
    const source = await makeDevCenterDataSource({
      name: "devcenter",
      collectionName: "search_content_prod",
      databaseName: "devcenter",
      connectionUri: DEVCENTER_CONNECTION_URI,
      baseUrl: "https://example.com",
    });

    const pages = await source.fetchPages();

    expect(pages.length).toBeGreaterThan(500);
  });
});
