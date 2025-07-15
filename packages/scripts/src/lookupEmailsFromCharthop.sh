#!/bin/bash

# -----------------------------------------------------------------------------
# ChartHop Email Lookup Script
#
# This script takes a list of names, searches for them in ChartHop to find
# their person ID, and then uses that ID to retrieve their work email address.
#
# Requirements:
#   - bash
#   - curl (usually pre-installed on macOS and Linux)
#   - jq (a lightweight and flexible command-line JSON processor)
#     Install jq:
#       - On macOS (via Homebrew): brew install jq
#       - On Debian/Ubuntu: sudo apt-get install jq
# -----------------------------------------------------------------------------

# --- Configuration ---

# IMPORTANT: Your ChartHop Authorization Token (Bearer).
# Treat this like a password. Avoid committing it to version control.
AUTH_TOKEN="${CHARTHOP_API_TOKEN}"

# Your ChartHop Organization ID (from the first API endpoint URL).
ORG_ID="${CHARTHOP_ORG_ID}"

# The organization name used in the person details URL (e.g., "mongodb").
ORG_NAME_FOR_URL="mongodb"

# --- List of Names ---
# Add the full names you want to look up into this array.
# The script will iterate through each name listed here.
NAMES=(
  "Michael Scott"
  "Dwight Schrute"
  "Jim Halpert"
  "Pam Beesly"
  "Ryan Howard"
  "Andy Bernard"
  "Kevin Malone"
  "Oscar Martinez"
)

# --- Script Logic ---

# 1. Verify that jq is installed.
if ! command -v jq &>/dev/null; then
  echo "Error: 'jq' is not installed." >&2
  echo "Please install jq to run this script." >&2
  echo "  - On macOS (Homebrew): brew install jq" >&2
  echo "  - On Debian/Ubuntu: sudo apt-get install jq" >&2
  exit 1
fi

# 2. Define a function to URL-encode strings for API calls.
url_encode() {
  echo -n "$1" | jq -s -R -r @uri
}

# 3. Set common headers for curl requests.
# These are taken from your examples to ensure API compatibility.
HEADERS=(
  -H 'accept: application/json, text/plain, */*'
  -H 'accept-language: en-US,en;q=0.9'
  -H "authorization: Bearer ${AUTH_TOKEN}"
  -H 'origin: https://app.charthop.com'
  -H 'referer: https://app.charthop.com/'
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
)

# 4. Print a header row for the CSV output.
echo "FullName,PersonID,WorkEmail"

# 5. Loop through each name, call the APIs, and print the results.
for name in "${NAMES[@]}"; do
  encoded_name=$(url_encode "$name")
  api_date=$(date +%Y-%m-%d)

  # --- STEP 1: Search for the person to get their ID ---
  search_url="https://api.charthop.com/v1/org/${ORG_ID}/search?q=${encoded_name}&entityTypes=jobs&limit=1&date=${api_date}&includeFormer=false"

  # Call the search API and use jq to parse the response.
  # We extract the 'personId' from the first result in the 'jobs' array.
  person_id=$(curl -s "${search_url}" "${HEADERS[@]}" | jq -r '.jobs[0].entity.personId')

  # --- STEP 2: If an ID was found, get their work email ---
  if [[ "$person_id" != "null" && -n "$person_id" ]]; then
    # For efficiency, we only request the 'contact.workEmail' field.
    person_url="https://api.charthop.com/v1/org/${ORG_NAME_FOR_URL}/person/${person_id}?fields=contact.workEmail&format=json-extended"

    # Call the person details API and use jq to find the WORK_EMAIL.
    work_email=$(curl -s "${person_url}" "${HEADERS[@]}" | jq -r '.contacts[] | select(.type=="WORK_EMAIL") | .value')

    if [[ "$work_email" != "null" && -n "$work_email" ]]; then
      echo "\"${name}\",\"${person_id}\",\"${work_email}\""
    else
      echo "\"${name}\",\"${person_id}\",\"<Work Email Not Found>\""
    fi
  else
    echo "\"${name}\",\"<Person ID Not Found>\",\"\""
  fi
done
