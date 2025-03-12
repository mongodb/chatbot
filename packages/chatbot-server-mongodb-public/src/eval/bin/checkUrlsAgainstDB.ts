/**
 @fileoverview Script to check if a list of URLs are ingested by the chatbot.
 Takes a JSON file containing URLs as input,
 checks if the urls are being ingested,
 and writes a JSON file with a list of urls that are not ingested.
 To properly check the urls, 
 we normalize the urls by removing the protocol (http/https) and 'www.' prefix before comparing against the database.
 check for URL redirects, and follow redirects to their final destinations. The final destinations are then checked against the database.
 The script handles an input file that is a list of url strings or URLs within objects
 */

import fs from "fs";
import { findMissingResources } from "./generateEvalCasesYamlFromCSV";

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

async function main({ urlListFilePath }: { urlListFilePath: string }) {
  let urlList = JSON.parse(fs.readFileSync(urlListFilePath, "utf-8"));
  // if urlList is an array of objects, convert it to an array of strings
  if (urlList[0].url) {
    urlList = urlList.map((urlObj: any) => urlObj.url);
  }
  // check list of urls against whats in the pages collection
  const urlsNotIngested = await findMissingResources(urlList);
  // look for urls that redirect
  const { noRedirect, redirectTo } = await getUrlRedirects(urlsNotIngested);
  // check if the pages we are redirecting to are in the pages collection again
  const urlsNotIngestedOfRedirectTo = await findMissingResources(
    Array.from(redirectTo)
  );
  // the urls we need to ingest are the ones that don't redirect (no-redirect) and the urls we redirect-to
  const urlsToIngest = new Set([...noRedirect, ...urlsNotIngestedOfRedirectTo]);
  // Write needed URLs to file
  const outputPath = urlListFilePath.replace(".json", "_urlsToIngest.json");
  console.log(`Writing to ${outputPath}`);
  await fs.writeFileSync(
    outputPath,
    JSON.stringify(Array.from(urlsToIngest)),
    "utf-8"
  );
  console.log("Done");
}

// Checks if the script is being run directly (not imported as a module) and handles command-line arguments.
if (require.main === module) {
  const args = process.argv.slice(2);
  const [urlListFilePath] = args;
  if (args.length < 1) {
    console.error(
      "Usage: npx ts-node checkUrlsAgainstDB.ts <urlListFilePath> \n" +
        "Arguments:\n" +
        "  urlListFilePath: Input json file path (required)\n" +
        "\nReceived args:",
      args
    );
    process.exit(1);
  }
  main({
    urlListFilePath,
  })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    })
    .finally(() => {
      console.log("hit finally");
      process.exit(0);
    });
}
