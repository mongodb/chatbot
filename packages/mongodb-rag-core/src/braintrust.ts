import { initLogger } from "braintrust";

export * from "braintrust";

/**
  Braintrust logger. Intialized with the env vars:

  ```ts
  {
    projectName: process.env.BRAINTRUST_PROJECT_NAME,
    apiKey: process.env.BRAINTRUST_API_KEY,
  }
  ```
 */
export const braintrustLogger = initLogger({
  projectName: process.env.BRAINTRUST_PROJECT_NAME,
  apiKey: process.env.BRAINTRUST_API_KEY,
});