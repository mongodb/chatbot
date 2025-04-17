import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { getBraintrustExperimentSummary } from "./getBraintrustExperimentSummary";

describe.skip("getBraintrustExperimentSummary", () => {
  it("should return the experiment summary", async () => {
    const { BRAINTRUST_API_KEY } = assertEnvVars(BRAINTRUST_ENV_VARS);
    const result = await getBraintrustExperimentSummary({
      experimentName:
        "mongosh-benchmark-official?experimentType=agentic&model=gemini-2.5-pro-preview-03-25",
      projectName: "natural-language-to-mongosh",
      apiKey: BRAINTRUST_API_KEY,
    });
    expect(result).toBeDefined();
  });
});
