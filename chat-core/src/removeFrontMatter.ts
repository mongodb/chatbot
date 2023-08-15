import frontmatter from "front-matter";
export function removeFrontMatter(content: string): string {
  const noFrontMatterContent = frontmatter(content.trimStart()).body;

  return noFrontMatterContent.trimStart();
}
