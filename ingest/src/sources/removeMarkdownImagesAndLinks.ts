/**
  Utility function to remove markdown images and links from a string.
  Useful if you do not want to include images and links in content,
  which can add significantly add to the token count when creating embeddings
  while also diluting the semantic meaning of the content.
 */
export function removeMarkdownImagesAndLinks(content: string) {
  const mdLink = /!?\[([\s\S]*?)\]\([\s\S]*?\)/g;

  let cleanedContent = content.replaceAll(mdLink, (match, text) => {
    // remove images
    if (match.startsWith("!")) {
      return "";
    } else return text;
  });
  // remove unnecessary new lines
  cleanedContent = cleanedContent.replaceAll(/\n{3,}/g, "\n\n");

  return cleanedContent;
}
