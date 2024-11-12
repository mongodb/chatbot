import { fromEnvironment } from "./environment";

export const assertEnvVars = <Required extends string>(ENV_VARS: {
  [K in Required]: "";
}) => {
  return fromEnvironment<Required, undefined>({
    required: Object.keys(ENV_VARS) as Required[],
  });
};
