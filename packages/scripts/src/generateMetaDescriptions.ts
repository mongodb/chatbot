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

// Helper to update the Status column in Google Sheet
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
  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName + "!1:1",
  });
  const headers = headerResp.data.values?.[0] || [];
  const statusColIdx = headers.findIndex(
    (h) => h.trim().toLowerCase() === "status"
  );
  if (statusColIdx === -1) throw new Error("Status column not found in sheet");
  const colLetter = String.fromCharCode("A".charCodeAt(0) + statusColIdx);
  const targetCell = `${tabName}!${colLetter}${rowIndex + 2}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: targetCell,
    valueInputOption: "RAW",
    requestBody: { values: [[newStatus]] },
  });
}

// Helper to update the Description column
async function updateDescriptionInGoogleSheet(
  sheetId: string,
  tabName: string,
  credentialsPath: string,
  rowIndex: number,
  newDescription: string
): Promise<void> {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName + "!1:1",
  });
  const headers = headerResp.data.values?.[0] || [];
  const descColIdx = headers.findIndex(
    (h) => h.trim().toLowerCase() === "description"
  );
  if (descColIdx === -1)
    throw new Error("Description column not found in sheet");
  const colLetter = String.fromCharCode("A".charCodeAt(0) + descColIdx);
  const targetCell = `${tabName}!${colLetter}${rowIndex + 2}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: targetCell,
    valueInputOption: "RAW",
    requestBody: { values: [[newDescription]] },
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
    .slice(0, 30);

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
      commandError = `ERROR: ${err.message || err}`;
    }
    // Update each row in the group
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
      try {
        await updateStatusInGoogleSheet(
          SHEETS_ID,
          SHEETS_TAB,
          SHEETS_CREDENTIALS,
          idx,
          statusMsg
        );
        if (generatedDescription && !statusMsg.startsWith("ERROR")) {
          await updateDescriptionInGoogleSheet(
            SHEETS_ID,
            SHEETS_TAB,
            SHEETS_CREDENTIALS,
            idx,
            generatedDescription
          );
        }
        console.log(`Row ${idx + 2} updated: ${statusMsg.substring(0, 80)}...`);
      } catch (err: any) {
        console.error(`Failed to update sheet for row ${idx + 2}:`, err);
      }
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
