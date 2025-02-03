import { initLogger } from "braintrust";

export * from "braintrust";

/**
  Braintrust logger. Intialized with the env vars:

  ```ts
  {
    projectName: process.env.BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME,
    apiKey: process.env.BRAINTRUST_API_KEY,
  }
  ```
 */
export const braintrustLogger = initLogger({
  projectName: process.env.BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME,
  apiKey: process.env.BRAINTRUST_TRACING_API_KEY,
});
