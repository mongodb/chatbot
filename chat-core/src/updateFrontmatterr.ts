import frontmatter from "front-matter";
import yaml from "yaml";
export function updateFrontMatter(
  text: string,
  metadata: Record<string, unknown>
): string {
  const frontmatterResult = frontmatter.test(text)
    ? frontmatter(text)
    : undefined;
  const body = frontmatterResult?.body ?? text;
  if (frontmatterResult?.attributes) {
    metadata = {
      ...frontmatterResult.attributes,
      ...metadata,
    };
  }

  return ["---", yaml.stringify(metadata).trim(), "---", "", body].join("\n");
}
