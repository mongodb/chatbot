import "dotenv/config";
import { assertEnvVars } from "mongodb-rag-core";
import { TEXT_TO_DRIVER_ENV_VARS } from "../TextToDriverEnvVars";
import {
  loadBraintrustDbDocuments,
  loadBraintrustMetadata,
} from "./loadBraintrustDatasets";

// Skipping tests b/c no Braintrust key in the CI.
describe.skip("loadBraintrustMetadata", () => {
  const { BRAINTRUST_API_KEY, BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME } =
    assertEnvVars(TEXT_TO_DRIVER_ENV_VARS);
  // TODO
  it("should load the braintrust metadata", async () => {
    const md = await loadBraintrustMetadata({
      apiKey: BRAINTRUST_API_KEY,
      projectName: BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    });
    expect(md.length).toBeGreaterThan(0);
  });
});

describe.skip("loadBraintrustDbDocuments", () => {
  const { BRAINTRUST_API_KEY, BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME } =
    assertEnvVars(TEXT_TO_DRIVER_ENV_VARS);
  it("should load the braintrust db documents", async () => {
    const docs = await loadBraintrustDbDocuments({
      apiKey: BRAINTRUST_API_KEY,
      projectName: BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    });
    expect(docs.length).toBeGreaterThan(0);
  });
});
