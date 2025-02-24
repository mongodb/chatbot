import fs from "fs";

// Match the entire meta directive block
const metaDirectiveRegex = /(?:^|\n)(.. meta::\s*\n(?:\s+:[^:]+:[^\n]*\n)*)/g;
// To find specific fields within the matched directive
const descriptionFieldRegex = /(\s+):description:([^\n]*)\n/;
const keywordsFieldRegex = /(\s+):keywords:([^\n]*)\n/;

export function hasMetaDirective(content: string): boolean {
  return metaDirectiveRegex.test(content);
}

export function updateMetaDescription(
  content: string,
  newDescription: string
): string {
  return content.replace(metaDirectiveRegex, (match) => {
    // Check if description field exists
    if (descriptionFieldRegex.test(match)) {
      // Replace existing description
      return match.replace(
        descriptionFieldRegex,
        `$1:description: ${newDescription}\n`
      );
    } else {
      // Add description field (preserve the final newline)
      return match.replace(/(\n)$/, `\n   :description: ${newDescription}$1`);
    }
  });
}

export function getMetaField(
  content: string,
  fieldName: "description" | "keywords"
): string | null {
  const fieldRegex =
    fieldName === "description" ? descriptionFieldRegex : keywordsFieldRegex;
  const metaMatch = content.match(metaDirectiveRegex);

  if (!metaMatch) return null;

  const fieldMatch = metaMatch[0].match(fieldRegex);
  return fieldMatch ? fieldMatch[2].trim() : null;
}

export function constructMetaDirective(args: {
  description: string | null;
  keywords: string | null;
}): string {
  if (args.description === null && args.keywords === null) {
    return "";
  }

  const metaDirectiveParts = [`.. meta::`];

  if (args.keywords) {
    metaDirectiveParts.push(`   :keywords: ${args.keywords}`);
  }

  if (args.description) {
    metaDirectiveParts.push(`   :description: ${args.description}`);
  }

  return metaDirectiveParts.join("\n");
}

/**
 Find the page title of a reStructuredText file and return the line number
 where the title definition ends.

 @param content - The content of the reStructuredText file as a string
 @returns The line number where the title definition ends, or -1 if no title is found
 */
export function findRstPageTitle(content: string): number {
  const validAdornmentChars = /^[=\-`:'"~^\\_*+#<>]+$/;

  // Split the content into lines
  const lines = content.split("\n");

  // Look for title pattern (line followed by adornment of same length)
  // We need to check for both underline-only and overline-underline patterns

  // Skip any frontmatter (comments, directives, field lists, etc.)
  let i = 0;
  while (
    i < lines.length &&
    (lines[i].trim().startsWith("..") ||
      lines[i].trim() === "" ||
      lines[i].trim().startsWith(":")) // Add this condition to skip field lists
  ) {
    i++;
  }

  // Check for overline-title-underline pattern
  if (i + 2 < lines.length) {
    const possibleOverline = lines[i].trim();
    const possibleTitle = lines[i + 1].trim();
    const possibleUnderline = lines[i + 2].trim();

    if (
      possibleOverline.length > 0 &&
      validAdornmentChars.test(possibleOverline) &&
      possibleTitle.length > 0 &&
      possibleUnderline === possibleOverline &&
      possibleOverline.length >= possibleTitle.length
    ) {
      // Found overline-title-underline pattern
      return i + 3; // Line number (1-based) of the underline
    }
  }

  // Check for title-underline pattern
  if (i + 1 < lines.length) {
    const possibleTitle = lines[i].trim();
    const possibleUnderline = lines[i + 1].trim();

    if (
      possibleTitle.length > 0 &&
      possibleUnderline.length > 0 &&
      validAdornmentChars.test(possibleUnderline) &&
      possibleUnderline.length >= possibleTitle.length
    ) {
      // Found title-underline pattern
      return i + 2; // Line number (1-based) of the underline
    }
  }

  // No title found
  return -1;
}

export function upsertMetaDirective(
  rstPageContent: string,
  metaDirectiveArgs: {
    description: string | null;
    keywords: string | null;
  }
): string {
  const pageHasMetaDirective = hasMetaDirective(rstPageContent);
  if (pageHasMetaDirective) {
    if (!metaDirectiveArgs.description) {
      throw new Error("Meta description is required");
    }
    return updateMetaDescription(rstPageContent, metaDirectiveArgs.description);
  } else {
    const metaDirective = constructMetaDirective(metaDirectiveArgs);
    const pageTitleLineNumber = findRstPageTitle(rstPageContent);
    if (pageTitleLineNumber === -1) {
      throw new Error("Page title not found");
    }
    const pageLines = rstPageContent.split("\n");
    const newRstPageContent = [
      ...pageLines.slice(0, pageTitleLineNumber),
      "",
      metaDirective,
      "",
      ...pageLines.slice(pageTitleLineNumber),
    ].join("\n");
    return newRstPageContent;
  }
}

export function upsertMetaDirectiveInFile(
  filePath: string,
  metaDirectiveArgs: {
    description: string | null;
    keywords: string | null;
  }
): void {
  const rstPageContent = fs.readFileSync(filePath, "utf8");
  const newRstPageContent = upsertMetaDirective(
    rstPageContent,
    metaDirectiveArgs
  );
  fs.writeFileSync(filePath, newRstPageContent);
}
