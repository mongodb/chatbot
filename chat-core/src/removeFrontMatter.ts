import frontmatter from "front-matter";
export function removeFrontMatter(content: string): string {
  return content.replace(/---\n([\s\S]*?)\n---/, "").trimStart();
}
