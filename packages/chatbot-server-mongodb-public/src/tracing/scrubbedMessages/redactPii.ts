import { redactMongoDbConnectionUri } from "mongodb-rag-core/executeCode";
import wellKnownNames from "./wellKnownNames.json";
import AhoCorasick from "ahocorasick";

export type Pii =
  | "email"
  | "phone"
  | "address"
  | "credit_card"
  | "social_security"
  | "connection_uri"
  | "name";

const nameMatcher = new AhoCorasick(wellKnownNames);

// These regex are taken from the deprecated [redact-pii](https://www.npmjs.com/package/redact-pii) package
const aptRegex =
  /(apt|bldg|dept|fl|hngr|lot|pier|rm|ste|slip|trlr|unit|#)\.? *[a-z0-9-]+\b/gi;
const poBoxRegex = /P\.? ?O\.? *Box +\d+/gi;
const roadRegex =
  /(street|st|road|rd|avenue|ave|drive|dr|loop|court|ct|circle|cir|lane|ln|boulevard|blvd|way)\.?\b/gi;

export const creditCardNumber =
  /\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}|\d{4}[ -]?\d{6}[ -]?\d{4}\d?/g;
export const streetAddress = new RegExp(
  "(\\d+\\s*(\\w+ ){1,2}" +
    roadRegex.source +
    "(\\s+" +
    aptRegex.source +
    ")?)|(" +
    poBoxRegex.source +
    ")",
  "gi"
);

export const zipcode = /\b\d{5}\b(-\d{4})?\b/g;
export const phoneNumber =
  /(\(\?\+?[0-9]{1,2}\)?[-. ]?)?(\(?[0-9]{3}\)?|[0-9]{3})[-. ]?([0-9]{3}[-. ]?[0-9]{4}|\b[A-Z0-9]{7}\b)/g;
export const ipAddress =
  /(\d{1,3}(\.\d{1,3}){3}|[0-9A-F]{4}(:[0-9A-F]{4}){5}(::|(:0000)+))/gi;
export const usSocialSecurityNumber = /\b\d{3}[ -.]\d{2}[ -.]\d{4}\b/g;
export const emailAddress = /([a-z0-9_\-.+]+)@\w+(\.\w+)*/gi;

// Define a type for our redactor functions
type RedactorFn = (text: string) => string;

const replacements: Record<Pii, string> = {
  email: "[EMAIL]",
  phone: "[PHONE]",
  address: "[ADDRESS]",
  credit_card: "[CREDIT_CARD]",
  social_security: "[SSN]",
  connection_uri: "[CONNECTION_URI]",
  name: "[NAME]",
};

// Function to redact names using Aho-Corasick
function redactNames(text: string): string {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  const matches = nameMatcher.search(lowerText);

  if (!matches || matches.length === 0) {
    return text;
  }

  // Find the actual occurrences of the names in the original text
  let result = text;
  const nameMatches = [];

  // For each matched name, find all occurrences in the original text (case-insensitive)
  for (const match of matches) {
    const keywords = match[1];
    if (keywords && keywords.length > 0) {
      for (const keyword of keywords) {
        // Create a regex to find the name with word boundaries
        const nameRegex = new RegExp(`\\b${keyword}\\b`, "gi");
        let nameMatch;
        while ((nameMatch = nameRegex.exec(result)) !== null) {
          nameMatches.push({
            position: nameMatch.index,
            length: nameMatch[0].length,
            original: nameMatch[0],
          });
        }
      }
    }
  }

  console.log("Name matches found:", nameMatches);

  // Sort matches by position in reverse order to avoid offset issues when replacing
  nameMatches.sort((a, b) => b.position - a.position);

  // Replace each match with the redaction placeholder
  for (const match of nameMatches) {
    console.log(
      `Replacing '${match.original}' at position ${match.position} with ${replacements.name}`
    );
    result =
      result.substring(0, match.position) +
      replacements.name +
      result.substring(match.position + match.length);
  }

  console.log("Final result:", result);
  return result;
}

// Create redactor functions for each PII type
const redactors: Record<Pii, RedactorFn> = {
  connection_uri: redactMongoDbConnectionUri, // Note: this must be run first, otherwise it will be redacted by the email redactor
  email: (text) => text.replace(emailAddress, replacements.email), // should be before name redaction in case name is in email
  name: redactNames, // Move name redaction earlier in the sequence
  phone: (text) => text.replace(phoneNumber, replacements.phone),
  address: (text) => text.replace(streetAddress, replacements.address),
  credit_card: (text) =>
    text.replace(creditCardNumber, replacements.credit_card),
  social_security: (text) =>
    text.replace(usSocialSecurityNumber, replacements.social_security),
};

export function redactPii(text: string): {
  redactedText: string;
  piiFound: Pii[];
} {
  const piiFound: Pii[] = [];
  let redactedText = text;

  for (const [piiType, redactor] of Object.entries(redactors) as [
    Pii,
    RedactorFn
  ][]) {
    const redactedResult = redactor(redactedText);
    if (redactedResult !== redactedText) {
      piiFound.push(piiType);
      redactedText = redactedResult;
    }
  }

  return {
    redactedText,
    piiFound,
  };
}
