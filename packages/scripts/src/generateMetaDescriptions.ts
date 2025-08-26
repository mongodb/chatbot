import { exec } from "child_process";
import { promisify } from "util";
import { google } from "googleapis";
import { z } from "zod";
import { getEnv } from "mongodb-rag-core";
import "dotenv/config";
import { strict as assert } from "assert";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

// Schema for validating Google Sheet rows
const metaDescriptionRecordSchema = z.object({
  project: z.string(),
  repo: z.string(),
  pathPrefix: z.string(),
  url: z.string(),
  metaDescription: z.string(),
});
type MetaDescriptionRecord = z.infer<typeof metaDescriptionRecordSchema>;

// Helper to read rows from Google Sheet
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
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName,
  });
  const rows = response.data.values;
  if (!rows || rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || "";
    });
    return obj;
  });
}

// Helper to batch update Status and Description columns in Google Sheet
async function batchUpdateSheet(
  sheetId: string,
  tabName: string,
  credentialsPath: string,
  updates: { rowIndex: number; status: string; description?: string }[]
) {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  // Get header row to find column indices
  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName + "!1:1",
  });
  const headers = headerResp.data.values?.[0] || [];
  const statusColIdx = headers.findIndex(
    (h) => h.trim().toLowerCase() === "status"
  );
  const descColIdx = headers.findIndex(
    (h) => h.trim().toLowerCase() === "description"
  );
  if (statusColIdx === -1 || descColIdx === -1)
    throw new Error("Status or Description column not found in sheet");

  // Prepare batch data
  const data = [];
  for (const { rowIndex, status, description } of updates) {
    // Status
    const statusColLetter = String.fromCharCode(
      "A".charCodeAt(0) + statusColIdx
    );
    const statusCell = `${tabName}!${statusColLetter}${rowIndex + 2}`;
    data.push({
      range: statusCell,
      values: [[status]],
    });
    // Description (if present)
    if (description) {
      const descColLetter = String.fromCharCode("A".charCodeAt(0) + descColIdx);
      const descCell = `${tabName}!${descColLetter}${rowIndex + 2}`;
      data.push({
        range: descCell,
        values: [[description]],
      });
    }
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      valueInputOption: "RAW",
      data,
    },
  });
}

async function main() {
  // Get config from env
  const {
    GOOGLE_SHEETS_ID: SHEETS_ID,
    GOOGLE_SHEETS_TAB: SHEETS_TAB,
    GOOGLE_APPLICATION_CREDENTIALS: SHEETS_CREDENTIALS,
  } = getEnv({
    optional: {
      GOOGLE_SHEETS_ID: undefined,
      GOOGLE_SHEETS_TAB: undefined,
      GOOGLE_APPLICATION_CREDENTIALS: undefined,
    },
  });

  assert(SHEETS_ID, "GOOGLE_SHEETS_ID is required");
  assert(SHEETS_TAB, "GOOGLE_SHEETS_TAB is required");
  assert(SHEETS_CREDENTIALS, "GOOGLE_APPLICATION_CREDENTIALS is required");

  // Read rows from Google Sheet
  const rawRows: any[] = await readRowsFromGoogleSheet(
    SHEETS_ID,
    SHEETS_TAB,
    SHEETS_CREDENTIALS
  );

  // Only process rows with Status === '' (empty string)
  const pendingRows = rawRows
    .map((row: any, idx: number) => ({ row, idx }))
    .filter(({ row }) => (row["Status"] ?? "") === "")
    .slice(0, 500);

  if (pendingRows.length === 0) {
    console.log("No rows with empty Status found in the sheet.");
    return;
  }

  // Group pending rows by repo
  const repoGroups: Record<string, { row: any; idx: number }[]> = {};
  for (const item of pendingRows) {
    const repo = item.row["Repo"];
    if (!repoGroups[repo]) repoGroups[repo] = [];
    repoGroups[repo].push(item);
  }

  // Process each repo group
  for (const [repo, group] of Object.entries(repoGroups)) {
    const runIdNamespace = repo.replace("/", "-");
    const timestamp = Date.now();
    const runId = `${runIdNamespace}-${timestamp}`;
    const urls = group.map(({ row }) => row["URL"]);
    const urlArgs = urls.map((url) => `--url ${url}`).join(" ");
    const command = `mongodb-ai generateDocsMetaDescription --llmMaxConcurrency=10 --runId='${runId}' ${urlArgs}`;
    let metaJson: Record<string, string> = {};
    const artifactPath = path.resolve(
      __dirname,
      `../runlogs/GenerateDocsMetaDescription/${runId}/metaDescriptions.json`
    );
    let commandError: string | null = null;
    try {
      const { stderr } = await execAsync(command);
      if (!fs.existsSync(artifactPath)) {
        commandError = `ERROR: metaDescriptions.json not found at ${artifactPath}`;
      } else {
        metaJson = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
      }
      if (stderr) {
        commandError =
          (commandError ? commandError + "\n" : "") +
          `[stderr]: ${stderr.trim()}`;
      }
    } catch (err: any) {
      commandError = `ERROR`;
    }
    // Collect all updates for this group
    const updates: {
      rowIndex: number;
      status: string;
      description?: string;
    }[] = [];
    for (const { row, idx } of group) {
      let statusMsg = "Generated";
      let generatedDescription = "";
      if (commandError) {
        statusMsg = commandError;
      } else {
        generatedDescription = metaJson[row["URL"]] || "";
        if (!generatedDescription) {
          statusMsg = `ERROR: No description found for URL in metaDescriptions.json`;
        }
      }
      updates.push({
        rowIndex: idx,
        status: statusMsg,
        description:
          generatedDescription && !statusMsg.startsWith("ERROR")
            ? generatedDescription
            : undefined,
      });
    }
    // Batch update the sheet for this group
    try {
      await batchUpdateSheet(
        SHEETS_ID,
        SHEETS_TAB,
        SHEETS_CREDENTIALS,
        updates
      );
      for (const { rowIndex, status } of updates) {
        console.log(
          `Row ${rowIndex + 2} updated: ${status.substring(0, 80)}...`
        );
      }
    } catch (err: any) {
      console.error(`Failed to batch update sheet for repo ${repo}:`, err);
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
