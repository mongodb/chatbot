import { readFileSync } from "fs";
import Path from "path";
import yaml from "yaml";
import {
  getTitleFromSnootyOpenApiSpecAst,
  snootyAstToOpenApiSpec,
} from "./snootyAstToOpenApiSpec";

const SRC_ROOT = Path.resolve(__dirname, "../../");

jest.setTimeout(30000);
import { SnootyPageEntry } from "./SnootyDataSource";
const textSpecPage: SnootyPageEntry = JSON.parse(
  readFileSync(
    Path.resolve(SRC_ROOT, "../testData/localOpenApiSpecPage.json"),
    {
      encoding: "utf-8",
    }
  )
);
const remoteSpecPage: SnootyPageEntry = JSON.parse(
  readFileSync(
    Path.resolve(SRC_ROOT, "../testData/remoteOpenApiSpecPage.json"),
    {
      encoding: "utf-8",
    }
  )
);

describe("snootyAstToOpenApiSpec()", () => {
  it("should return empty string for non-openapi node", async () => {
    const node = {
      type: "directive",
      name: "foo",
      children: [],
    };
    expect(await snootyAstToOpenApiSpec(node)).toBe("");
  });
  it("should return YAML string for openapi text node", async () => {
    const yamlString = await snootyAstToOpenApiSpec(textSpecPage.data.ast);
    const expected = `openapi: 3.1.0
info:
  version: v1
  title: MongoDB Atlas Data API
  description: >
    A fully-managed API to read, write, and aggregate data in MongoDB
    Atlas. The Data API is powered by serverless Atlas Functions and
    secured with user authentication and role-based permissions. To
    learn more about the Data API, see Atlas Data
    API.

    ## Set Up the Data API

    Before you can use the Data API, you must enable and configure it in
    an Atlas App Services App. The configuration controls how the App's
    users authenticate, authorize requests, and interact with the API.

    To learn how to start using the Data API in your App, see Set up
    the Data
    API.

    ## Authenticate Requests

    Your Data API configuration in App Services controls how users
    authenticate their API requests. In most cases, you will use
    Application authentication, which lets users log in with one of the
    App's authentication providers. Users can either provide their login
    credentials directly in every request or provide a reusable access
    token for an authenticated session.

    To learn more, see Authenticate Data API
    Requests.
servers:`;
    expect(yamlString).toContain(expected);
  });
  it("should return YAML string for openapi remote node", async () => {
    const yamlString = await snootyAstToOpenApiSpec(remoteSpecPage.data.ast);
    const parsed = yaml.parse(yamlString);
    const expectedSample = {
      openapi: "3.0.1",
      servers: [{ url: "https://cloud.mongodb.com" }],
    };
    expect(parsed).toMatchObject(expectedSample);
  });
});

describe("getTitleFromSnootyOpenApiSpecAst()", () => {
  const title = getTitleFromSnootyOpenApiSpecAst(textSpecPage.data.ast);
  expect(title).toBe("Atlas App Services Data API");
});
