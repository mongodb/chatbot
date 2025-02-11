/**
  @fileoverview Grab bag of stuff to help with parsing a page.
 */
import { Code, Heading, Node, Text } from "mdast";
import { SKIP, visit } from "unist-util-visit";
import { AstExtractedCodeblock } from "./AstExtractedCodeBlock.js";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { Parent } from "unist";
import { PersistedPage } from "mongodb-rag-core";

export function makePageParser() {
  return unified().use(remarkParse).use(remarkGfm);
}

export function extractCodeBlocksWithHeadings({
  ast,
  page,
}: {
  ast: Node;
  page: PersistedPage;
}): AstExtractedCodeblock[] {
  const codeBlocks: AstExtractedCodeblock[] = [];
  visit(ast, "code", (node: Code, index: number, parent: Parent) => {
    const programmingLanguage = node.lang ?? null;
    const code = node.value;

    const metadata = {
      pageUrl: page.url,
      sourceName: page.sourceName,
      pageTitle: page.title,
      tags: page.metadata?.tags ?? [],
      mdastNode: node,
      parentHeadings: {} as Record<string, unknown>,
    } satisfies AstExtractedCodeblock["metadata"];

    visit(
      parent,
      "heading",
      (heading: Heading, siblingIndex: number) => {
        if (siblingIndex >= index) {
          return SKIP;
        }
        const currentHeadings = Object.keys(metadata.parentHeadings)
          .map((heading) => parseInt(heading.slice(1)))
          .sort();
        if (
          currentHeadings.includes(heading.depth) ||
          heading.depth >= currentHeadings[currentHeadings.length - 1]
        ) {
          return SKIP;
        }
        let headingText = "";
        visit(heading, "text", (text: Text) => {
          headingText += text.value;
        });
        if ((heading.children[0] as Text)?.value) {
          metadata.parentHeadings[`h${heading.depth}`] = headingText;
        }
        return true;
      },
      // revere order of visiting
      true
    );
    codeBlocks.push({
      code,
      programmingLanguage,
      metadata,
    });
    return true;
  });
  return codeBlocks;
}
