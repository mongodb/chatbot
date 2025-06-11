/**
  Utility function to remove a markdown file extension (.md or .markdown) 
  from a string. 
  Can be used in MarkdownUrlDataSource to transform markdown URLs to page URLs.
 */
export function removeMarkdownFileExtension(url: string): string {
  if (url.endsWith(".md")) {
    return url.slice(0, -3);
  } else if (url.endsWith(".markdown")) {
    return url.slice(0, -9);
  }
  return url;
}
