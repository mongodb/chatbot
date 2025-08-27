/*
Script: upsertMetaDirective.ts

Purpose:
  - Updates meta descriptions in local rST files based on data from either a Google Sheet or a local CSV file.
  - If using Google Sheets, updates the 'Status' column to reflect successful updates or errors.

Environment Variables:
  - GOOGLE_SHEETS_ID: (string) The ID of the Google Sheet to use as the data source.
  - GOOGLE_SHEETS_TAB: (string) The name of the tab/sheet within the Google Sheet.
  - GOOGLE_APPLICATION_CREDENTIALS: (string) Path to the Google service account credentials JSON file (required for Google Sheets access).
  - CSV_FILE_PATH: (string) Path to a local CSV file (used if Google Sheets env vars are not set).

Data Source Selection Logic:
  - If GOOGLE_SHEETS_ID and GOOGLE_SHEETS_TAB are set, use Google Sheets as the data source.
  - Else, if CSV_FILE_PATH is set, use the local CSV file.
  - Note that the local CSV file doesn't need a status field update
  - Else, throw an error and exit, prompting the user to set the required environment variables.

Google Sheets Setup:
  - Create a Google Cloud project and enable the Google Sheets API.
  - Create a service account and download the credentials JSON file.
  - Share the target Google Sheet with the service account's email address.
  - Set the GOOGLE_APPLICATION_CREDENTIALS env var to the path of the credentials JSON file.

Status Column Logic:
  - Only process rows where Status is 'Approved'.
  - After a successful update, set Status to 'Page Updated'.
  - If an error occurs, set Status to 'ERROR'.
  - Valid Status values: 'Generated', 'Approved', 'Page Updated', 'ERROR'.
*/

// A CLI script that accepts a docs rST file path and an updated meta description
// The script will update the meta description in the rST file in place
// Usage: node build/upsertMetaDirective.js <path-to-rst-file> <meta-description>

import path from "path";
import fs from "fs";
import { upsertMetaDirectiveInFile } from "./meta2rst";
import { parse } from "csv/sync";
import { z } from "zod";
import { homedir } from "os";
import { google } from "googleapis";
import { getEnv } from "mongodb-rag-core";
import "dotenv/config";
import { strict as assert } from "assert";

// Example of CSV data
// Project,Repo,Path Prefix,Status,URL,Description,,
// Compass,mongodb/docs-compass,compass,Approved,https://mongodb.com/docs/compass/current/agg-pipeline-builder/export-pipeline-results/,"Export your aggregation pipeline results from Compass as JSON or CSV files, with options for advanced JSON formats to preserve data types.",,
// Compass,mongodb/docs-compass,compass,Approved,https://mongodb.com/docs/compass/current/agg-pipeline-builder/count-pipeline-results/,View the number of documents outputted by your aggregation pipeline using the count results button in MongoDB Compass.,,
// Compass,mongodb/docs-compass,compass,Approved,https://mongodb.com/docs/compass/current/agg-pipeline-builder/export-pipeline-to-language/,Export aggregation pipelines to various programming languages using the Aggregation Pipeline Builder for integration into applications.,,
const metaDescriptionRecordSchema = z.object({
  project: z.string(),
  repo: z.string(),
  pathPrefix: z.string(),
  url: z.string(),
  metaDescription: z.string(),
});

type MetaDescriptionRecord = z.infer<typeof metaDescriptionRecordSchema>;

// Transform and group by repo
type RepoUpdates = {
  org: string;
  repo: string;
  pathPrefix: string;
  updates: {
    url: string;
    metaDescription: string;
  }[];
};

function resolveFilePath(args: {
  repoPath: string;
  pathPrefix: string;
  url: string;
}) {
  // Files always end in .txt
  // URLs always begin with "https://mongodb.com/docs/"
  // First, look for the file at the url path. If it's not there, look for a directory with an index.txt file.
  // e.g. for {
  //   url: "https://mongodb.com/docs/manual/core/foo/bar/",
  //   pathPrefix: "manual/core",
  // }
  // The file is either at:
  // - {repoPath}/source/foo/bar.txt
  // - {repoPath}/source/foo/bar/index.txt
  // Or does not exist - return null for this case.
  // Otherwise, return the file path.
  const urlPath = args.url
    // Remove the base URL and path prefix (if it exists)
    .replace(
      `https://mongodb.com/docs/${
        args.pathPrefix ? args.pathPrefix + "/" : ""
      }`,
      ""
    )
    // Remove "/current" from the start if it exists
    .replace(/^current/, "")
    // Remove trailing slash
    .replace(/\/$/, "");
  // urlPath has the form "foo/bar"
  const coreFilePath = path.join(args.repoPath, "source", urlPath);
  const txtFilePath = coreFilePath + ".txt";
  const dirIndexFilePath = path.join(coreFilePath, "index.txt");
  console.log(
    JSON.stringify(
      {
        repoPath: args.repoPath,
        coreFilePath,
        txtFilePath,
        dirIndexFilePath,
      },
      null,
      2
    )
  );
  if (fs.existsSync(txtFilePath)) {
    return txtFilePath;
  }
  if (fs.existsSync(dirIndexFilePath)) {
    return dirIndexFilePath;
  }
  return null;
}

// --- Data Source Selection ---
const {
  GOOGLE_SHEETS_ID: SHEETS_ID,
  GOOGLE_SHEETS_TAB: SHEETS_TAB,
  GOOGLE_APPLICATION_CREDENTIALS: SHEETS_CREDENTIALS,
  CSV_FILE_PATH,
} = getEnv({
  optional: {
    GOOGLE_SHEETS_ID: undefined,
    GOOGLE_SHEETS_TAB: undefined,
    GOOGLE_APPLICATION_CREDENTIALS: undefined,
    CSV_FILE_PATH: undefined,
  },
});

let dataSource: "google-sheets" | "csv" | null = null;

if (SHEETS_ID && SHEETS_TAB) {
  if (!SHEETS_CREDENTIALS) {
    console.error(
      "ERROR: GOOGLE_APPLICATION_CREDENTIALS env var must be set to use Google Sheets."
    );
    process.exit(1);
  }
  dataSource = "google-sheets";
  console.log(`Using Google Sheets: ID=${SHEETS_ID}, Tab=${SHEETS_TAB}`);
} else if (CSV_FILE_PATH) {
  dataSource = "csv";
  console.log(`Using local CSV file: ${CSV_FILE_PATH}`);
} else {
  console.error(
    "ERROR: You must set either GOOGLE_SHEETS_ID and GOOGLE_SHEETS_TAB (and GOOGLE_APPLICATION_CREDENTIALS), or CSV_FILE_PATH."
  );
  process.exit(1);
}

// Google Sheets integration

// --- Google Sheets Helpers ---

/**
 Reads rows from the specified Google Sheet tab.
 Returns an array of objects with keys matching the header row.
 */
async function readRowsFromGoogleSheet(
  sheetId: string,
  tabName: string,
  credentialsPath: string
): Promise<any[]> {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
  const sheets = google.sheets({ version: "v4", auth });
  // Get all rows from the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName,
  });
  const rows = response.data.values;
  if (!rows || rows.length < 2) {
    return [];
  }
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || "";
    });
    return obj;
  });
}

/**
 Updates the Status column for a specific row in the Google Sheet.
 rowIndex is 0-based (excluding header row).
 */
async function updateStatusInGoogleSheet(
  sheetId: string,
  tabName: string,
  credentialsPath: string,
  rowIndex: number,
  newStatus: string
): Promise<void> {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  // First, get the header row to find the Status column index
  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName + "!1:1",
  });
  const headers = headerResp.data.values?.[0] || [];
  const statusColIdx = headers.findIndex(
    (h) => h.trim().toLowerCase() === "status"
  );
  if (statusColIdx === -1) {
    throw new Error("Status column not found in sheet");
  }
  // Google Sheets API is 1-based for rows, A1 notation for columns
  const colLetter = String.fromCharCode("A".charCodeAt(0) + statusColIdx);
  const targetCell = `${tabName}!${colLetter}${rowIndex + 2}`; // +2 for header and 1-based
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: targetCell,
    valueInputOption: "RAW",
    requestBody: {
      values: [[newStatus]],
    },
  });
}

async function main() {
  let metaDescriptionRecords: MetaDescriptionRecord[] = [];
  const sheetRowIndexMap: number[] = []; // Only used for Google Sheets

  let rawRows: any[] = [];
  if (dataSource === "google-sheets") {
    assert(SHEETS_ID, "SHEETS_ID is required for Google Sheets");
    assert(SHEETS_TAB, "SHEETS_TAB is required for Google Sheets");
    assert(
      SHEETS_CREDENTIALS,
      "SHEETS_CREDENTIALS is required for Google Sheets"
    );
    // Read from Google Sheets
    rawRows = await readRowsFromGoogleSheet(
      SHEETS_ID,
      SHEETS_TAB,
      SHEETS_CREDENTIALS
    );
  } else if (dataSource === "csv") {
    if (!CSV_FILE_PATH) {
      console.error("ERROR: CSV_FILE_PATH is required");
      process.exit(1);
    }
    const csvFile = fs.readFileSync(CSV_FILE_PATH, "utf8");
    rawRows = parse(csvFile, { columns: true });
  } else {
    throw new Error("Invalid data source");
  }

  // Only process rows with Status === 'Approved' (for both sources)
  // For Google Sheets, track row indices for updating status
  metaDescriptionRecords = rawRows
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => row["Status"] === "Approved")
    .map(({ row, idx }) => {
      if (dataSource === "google-sheets") sheetRowIndexMap.push(idx);
      return metaDescriptionRecordSchema.parse({
        project: row["Project"],
        repo: row["Repo"],
        pathPrefix: row["Path Prefix"],
        url: row["URL"],
        metaDescription: row["Description"],
      });
    });

  // Transform and group by repo (existing logic)
  const updatesByRepo = metaDescriptionRecords.reduce((acc, record) => {
    const [org, repo] = record.repo.split("/");
    if (!acc[record.repo]) {
      acc[record.repo] = {
        org,
        repo,
        pathPrefix: record.pathPrefix,
        updates: [],
      };
    }
    acc[record.repo].updates.push({
      url: record.url,
      metaDescription: record.metaDescription,
    });
    return acc;
  }, {} as Record<string, RepoUpdates>);

  // Write updates to files
  const missingFileUrls: string[] = [];
  const baseReposDir = path.resolve(homedir(), "github-repos");
  console.log("Base repos dir: ", baseReposDir);

  // For Google Sheets, we need to keep track of which metaDescriptionRecord maps to which row
  let processedCount = 0;
  for (const { org, repo, pathPrefix, updates } of Object.values(
    updatesByRepo
  )) {
    console.log(`\n\nREPO: ${org}/${repo}`);
    const repoPath = path.join(baseReposDir, org, repo);
    if (!fs.existsSync(repoPath)) {
      console.log(`ERROR: Repo does not exist: ${repoPath}`);
      continue;
    }
    for (const update of updates) {
      console.log(`\nUPDATE: ${update.url}`);
      const filePath = resolveFilePath({
        repoPath,
        pathPrefix,
        url: update.url,
      });

      let updateStatus: "Page Updated" | "ERROR" = "Page Updated";
      if (!filePath) {
        console.log(`ERROR: File does not exist: ${update.url}`);
        missingFileUrls.push(update.url);
        updateStatus = "ERROR";
      } else {
        try {
          upsertMetaDirectiveInFile(
            filePath,
            {
              description: update.metaDescription,
              keywords: null,
            },
            {
              allowOverwrite: false,
            }
          );
        } catch (e) {
          console.log(
            `ERROR: Failed to upsert meta directive: ${update.url}`,
            e
          );
          updateStatus = "ERROR";
        }
      }
      // If using Google Sheets, update the status column
      if (dataSource === "google-sheets") {
        const rowIndex = sheetRowIndexMap[processedCount];
        updateStatusInGoogleSheet(
          SHEETS_ID!,
          SHEETS_TAB!,
          SHEETS_CREDENTIALS!,
          rowIndex,
          updateStatus
        ).catch((err) => {
          console.error(
            `Failed to update status in Google Sheet for row ${rowIndex + 2}:`,
            err
          );
        });
        processedCount++;
      }
    }
  }
}

// Run main if this is the entry point
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
