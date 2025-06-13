import { OpenAI } from "openai";
import { ModelConfig } from "./models";
import { strict as assert } from "assert";
import { wrapOpenAI } from "braintrust";
interface BaseModelProviderConfig {
  apiKey: string;
  endpoint: string;
}

interface MakeOpenAiClientFactoryParams {
  braintrust?: BaseModelProviderConfig;
  vertexAi?: BaseModelProviderConfig;
}

export function makeOpenAiClientFactory({
  braintrust,
}: MakeOpenAiClientFactoryParams) {
  return {
    makeOpenAiClient(modelConfig: ModelConfig) {
      let openAiClient: OpenAI;
      if (modelConfig.provider === "braintrust") {
        assert(braintrust, "Braintrust OpenAI config must be provided");
        openAiClient = wrapOpenAI(
          new OpenAI({
            apiKey: braintrust.apiKey,
            baseURL: braintrust.endpoint,
          })
        );
      } else {
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
      }

      return openAiClient;
    },
  };
}
