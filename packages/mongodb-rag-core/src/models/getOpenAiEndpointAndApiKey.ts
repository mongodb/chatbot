import { ModelConfig } from "./models";
import { BRAINTRUST_ENV_VARS, GCP_VERTEX_AI_ENV_VARS } from "../CoreEnvVars";
import { assertEnvVars } from "../assertEnvVars";
import { GoogleAuth } from "google-auth-library";
import { strict as assert } from "assert";

export async function getOpenAiEndpointAndApiKey(model: ModelConfig) {
  if (model.provider === "braintrust") {
    const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
      assertEnvVars(BRAINTRUST_ENV_VARS);
    return {
      baseURL: BRAINTRUST_ENDPOINT,
      apiKey: BRAINTRUST_API_KEY,
    };
  }
  if (model.provider === "gcp_vertex_ai") {
    const { GCP_OPENAI_ENDPOINT } = assertEnvVars(GCP_VERTEX_AI_ENV_VARS);
    const accessToken = await getGcpAccessToken();
    assert(typeof accessToken === "string", "GCP access token not found");
    return {
      baseURL: GCP_OPENAI_ENDPOINT,
      apiKey: accessToken,
    };
  }
  throw new Error(`Unknown provider: ${model.provider}`);
}

/**
  Get GCP access token. To set up locally, run `gcloud auth application-default login`.
 */
export async function getGcpAccessToken() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const accessToken = accessTokenResponse.token;
  return accessToken;
}
