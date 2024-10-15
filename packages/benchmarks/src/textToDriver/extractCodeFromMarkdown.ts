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
