import { assertEnvVars } from "mongodb-rag-core";
import { BRAINTRUST_ENV_VARS } from "../envVars";
import { getBraintrustExperimentResults } from "./getBraintrustExperimentResults";

// Skipping braintrust integration test for CI
describe.skip("getBraintrustExperimentResults", () => {
  it("should return experiment results", async () => {
    const { BRAINTRUST_API_KEY } = assertEnvVars(BRAINTRUST_ENV_VARS);
    const projectName = "mongodb-multiple-choice";
    const experiments = ["gpt-4o-badge-631d3a9b"];
    const result = await getBraintrustExperimentResults({
      experimentName: experiments[0],
      projectName,
      apiKey: BRAINTRUST_API_KEY,
    });
    // All items should have input, output, and scores
    for (const item of result) {
      expect(item.scores).toBeDefined();
      expect(item.output).toBeDefined();
      expect(item.input).toBeDefined();
    }
    // At least some items should have tags
    const hasTags = result.some(
      (item) => item.tags !== undefined && item.tags.length > 0
    );
    expect(hasTags).toBe(true);
  });
});
