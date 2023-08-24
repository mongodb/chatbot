import frontmatter from "front-matter";
import yaml from "yaml";

export function updateFrontMatter(
  text: string,
  metadataIn: Record<string, unknown>
): string {
  const { metadata: existingMetadata, body } = extractFrontMatter(text);
  const metadata = {
    ...(existingMetadata ?? {}),
    ...metadataIn,
  };
  return ["---", yaml.stringify(metadata).trim(), "---", "", body].join("\n");
}

export function extractFrontMatter(text: string): {
  metadata?: Record<string, unknown>;
  body: string;
} {
  const frontmatterResult = frontmatter.test(text)
    ? frontmatter(text)
    : undefined;
  return {
    metadata: frontmatterResult?.attributes as Record<string, unknown>,
    body: frontmatterResult?.body ?? text,
  };
}
