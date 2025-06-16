import "dotenv/config";
import { assertEnvVars } from "mongodb-rag-core";
import { BRAINTRUST_ENV_VARS } from "./TextToDriverEnvVars";
import {
  loadBraintrustDbDocuments,
  loadLegacyTextToDriverBraintrustEvalCases,
  loadBraintrustMetadata,
  loadTextToDriverBraintrustEvalCases,
} from "./loadBraintrustDatasets";
jest.setTimeout(60000);
const { BRAINTRUST_API_KEY, BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

// Skipping tests b/c no Braintrust key in the CI.

describe.skip("loadBraintrustMetadata", () => {
  it("should load the braintrust metadata", async () => {
    const md = await loadBraintrustMetadata({
      apiKey: BRAINTRUST_API_KEY,
      projectName: BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    });
    expect(md.length).toBeGreaterThan(0);
  });
});

describe.skip("loadBraintrustDbDocuments", () => {
  it("should load the braintrust db documents", async () => {
    const docs = await loadBraintrustDbDocuments({
      apiKey: BRAINTRUST_API_KEY,
      projectName: BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    });
    expect(docs.length).toBeGreaterThan(0);
  });
});

describe.skip("loadLegacyTextToDriverBraintrustEvalCases", () => {
  it("should load the braintrust eval cases", async () => {
    const cases = await loadLegacyTextToDriverBraintrustEvalCases({
      apiKey: BRAINTRUST_API_KEY,
      projectName: BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
      datasetName: "text-to-query-results",
    });
    console.log(cases.length);
    expect(cases.length).toBeGreaterThan(0);
  });
});

describe("loadTextToDriverBraintrustEvalCases", () => {
  it("should load the braintrust eval cases", async () => {
    const cases = await loadTextToDriverBraintrustEvalCases({
      apiKey: BRAINTRUST_API_KEY,
      projectName: "natural-language-to-mongosh",
      datasetName: "atlas_sample_dataset_manual_review",
    });
    console.log(cases.length);
    expect(cases.length).toBeGreaterThan(0);
  });
});
