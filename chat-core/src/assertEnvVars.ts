import { URL_ENV_VARS } from "CoreEnvVars";


export const assertEnvVars = <T extends Record<string, string>>(
  ENV_VARS: T
): T => {
  const vars: Record<string, string | unknown> = { ...ENV_VARS };
  const anyVarMissing = Object.keys(vars).reduce(
    (anyVarMissing, currentVar) => {
      // Get this var value from process.env - either valid string or undefined
      vars[currentVar] = process.env[currentVar];

      // if the var is a url, make sure it has a following slash
      if (URL_ENV_VARS.includes(currentVar)) {
        vars[currentVar] = ensure_url_slash_termination(vars[currentVar] as string);
      }

      // Return true if any var was missing so far or if this var was not set
      return anyVarMissing || !vars[currentVar];
    },
    false
  );
  if (anyVarMissing) {
    throw new Error(`Missing env var(s):
${Object.entries(vars)
  .filter(([, value]) => !value)
  .map(([key]) => `- ${key}`)
  .join("\n")}`);
  }
  return vars as T;
};

const ensure_url_slash_termination = (url: string): string => url.endsWith("/") ? url : `${url}/`;
