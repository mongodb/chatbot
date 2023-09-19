import frontmatter, { FrontMatterOptions } from "front-matter";
export function removeFrontMatter(
  content: string,
  options?: FrontMatterOptions
): string {
  const noFrontMatterContent = frontmatter(content.trimStart(), options).body;

  return noFrontMatterContent.trimStart();
}
