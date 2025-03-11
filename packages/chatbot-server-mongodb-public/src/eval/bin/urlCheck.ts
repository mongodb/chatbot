import fs from "fs";
import { findMissingResources } from "./generateEvalCasesYamlFromCSV";
import { urls } from "./urls";
import { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } from "../../config";
import { makeMongoDbPageStore } from "mongodb-rag-core";

const pageStore = makeMongoDbPageStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

async function getFinalUrl(url: string): Promise<string> {
  let currentUrl = url;
  let shouldContinue = true;

  while (shouldContinue) {
    try {
      const response = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
      });
      if (response.status === 301 || response.status === 302) {
        const location = response.headers.get("Location");
        if (location) {
          currentUrl = new URL(location, currentUrl).toString();
        } else {
          shouldContinue = false;
        }
      } else {
        shouldContinue = false;
      }
    } catch (error) {
      console.error(`Error fetching ${currentUrl}:`, error);
      shouldContinue = false;
    }
  }
  return currentUrl;
}

const getUrlRedirects = async (
  urls: string[]
): Promise<{ noRedirect: Set<string>; redirectTo: Set<string> }> => {
  const redirectTo = new Set<string>();
  const noRedirect = new Set<string>();
  for (const url of urls) {
    const finalUrl = await getFinalUrl(url);
    if (finalUrl !== url) {
      redirectTo.add(finalUrl);
    } else {
      noRedirect.add(url);
    }
  }
  return {
    noRedirect,
    redirectTo,
  };
};

async function main() {
  const sergiosUrlList: string[] = urls;
  // check sergios list of urls against whats in the pages collection
  const urlsNotIngested = await findMissingResources(sergiosUrlList);
  // look for urls that redirect
  const { noRedirect, redirectTo } = await getUrlRedirects(urlsNotIngested);
  // check if the pages we are redirecting to are in the pages collection again
  const urlsNotIngestedOfRedirectTo = await findMissingResources(
    Array.from(redirectTo)
  );
  // the urls we need to ingest are the ones that don't redirect (no-redirect) and the urls we redirect-to
  const urlsToIngest = new Set([...noRedirect, ...urlsNotIngestedOfRedirectTo]);
  // Write needed URLs to file
  await fs.writeFileSync(
    "urlsToIngest.ts",
    `export const urlsToIngest = ${JSON.stringify(
      Array.from(urlsToIngest),
      null,
      2
    )};`,
    "utf-8"
  );
}

main().finally(() => {
  pageStore.close();
});
