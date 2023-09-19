/**
  Extract the first H1 from a Markdown string

  @param mdContent - some Markdown content
  @returns page H1 `string` if it exists, otherwise `null`
  @example
  ```ts
  const mdContent = "# My Page Title";
  const pageTitle = extractMarkdownH1(mdContent);
  console.log(pageTitle); // "My Page Title"

  const noTitleMdContent = "content without a h1";
  const noTitle = extractMarkdownH1(noTitleMdContent);
  console.log(noTitle); // null
  ```
 */
export function extractMarkdownH1(mdContent: string) {
  const h1Regex = /^#\s(.+)$/gm;
  const matches = mdContent.match(h1Regex);
  if (matches && matches.length > 0) {
    const title = matches[0].replace("# ", "");
    return title;
  }
}
