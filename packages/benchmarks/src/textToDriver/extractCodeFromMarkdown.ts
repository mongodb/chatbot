/**
  Extracts code from markdown by removing all code blocks and returning the rest of the markdown.
  If there are no markdown code blocks, the original text is returned.
 */
export function extractCodeFromMarkdown(maybeMarkdown: string) {
  if (hasMarkdownCodeblock(maybeMarkdown)) {
    const codeBlocks = maybeMarkdown.match(/```[\w]*\n([\s\S]*?)```/g) || [];
    return codeBlocks
      .map((block) =>
        block.replaceAll(/```[\w]*\n([\s\S]*?)```/gs, "$1").trim()
      )
      .join("\n\n");
  }
  return maybeMarkdown;
}

export function hasMarkdownCodeblock(maybeMarkdown: string) {
  return /```[\w]*\n([\s\S]*?)```/g.test(maybeMarkdown);
}
