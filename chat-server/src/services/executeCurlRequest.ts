import { exec } from "child_process";
import { HttpApiCredentials, HttpRequestArgs } from "./HttpRequestArgs";
import { logger } from "chat-core";
export async function executeCurlRequest(
  curlCommand: string,
  credentials: HttpApiCredentials,
  staticHttpRequestArgs?: HttpRequestArgs
): Promise<string> {
  const originalCurlCommand = curlCommand;
  curlCommand = curlCommand.replace("{username}", credentials.username);
  curlCommand = curlCommand.replace("{password}", credentials.password);
  // Replace path params

  for (const pathParametersKey in staticHttpRequestArgs?.pathParameters) {
    curlCommand = curlCommand.replace(
      `{${pathParametersKey}}`,
      staticHttpRequestArgs.pathParameters[pathParametersKey] as string
    );
  }

  for (const queryParametersKey in staticHttpRequestArgs?.queryParameters) {
    const url = new URL(curlCommand);
    url.searchParams.append(
      queryParametersKey,
      staticHttpRequestArgs.queryParameters[queryParametersKey] as string
    );
    curlCommand = url.toString();
  }
  return new Promise((resolve, _reject) => {
    exec(curlCommand, (error, stdout, stderr) => {
      console.log({ error, stdout, stderr });
      if (stdout) {
        logger.info("stdout::", stdout);
        if (stdout.length > 3000) {
          resolve(
            "The message was too long to fit in the LLM context window, but here's the beginning of it:\n" +
              stdout.slice(0, 3000)
          );
          return;
        }
        resolve(stdout);
        return;
      }
      if (error !== null) {
        logger.error(error);
        resolve(`There was an error executing the curl command:
${originalCurlCommand}`);
        return;
      }

      if (stderr) {
        logger.error(error);
        resolve(`There was an error executing the curl command:
${originalCurlCommand}`);
        return;
      }
    });
  });
}
