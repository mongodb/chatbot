import { ModelConfig } from "./models";
import { BRAINTRUST_ENV_VARS } from "../CoreEnvVars";
import { assertEnvVars } from "../assertEnvVars";

export async function getOpenAiEndpointAndApiKey(model: ModelConfig) {
  if (model.provider === "braintrust") {
    const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
      assertEnvVars(BRAINTRUST_ENV_VARS);
    return {
      baseURL: BRAINTRUST_ENDPOINT,
      apiKey: BRAINTRUST_API_KEY,
    };
  }
  throw new Error(`Unknown provider: ${model.provider}`);
}
