import { visit } from "unist-util-visit";
import { Plugin } from "unified";
import { type Node } from "unist";
import { DeepPartial } from "./utils";

export interface HeadingNode extends Node {
  type: "heading";
  depth: number;
  children: Node[];
  data?: {
    [key: string]: unknown;
  };
}

export interface HeadingStyleNode extends HeadingNode {
  data: {
    headingStyle: "atx" | "setext";
    [key: string]: unknown;
  };
}

/**
  Analyzes a heading node and marks it as ATX-style or setext-style.
 */
export function addHeadingStyle(node: HeadingNode) {
  if (!node.data) {
    node.data = {};
  }
  // Assume ATX by default
  node.data.headingStyle = "atx";
  // Check if the heading is actually a setext-style heading
  if (node.depth < 3 && node.position !== undefined) {
    if (node.position.start.line !== node.position.end.line) {
      node.data.headingStyle = "setext";
    }
  }
}

/**
  A unified plugin that analyzes headings and marks them as ATX-style headings or setext-style headings.
 */
export const headingStyle: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "heading", addHeadingStyle);
  };
};

/**
  A unified plugin that converts setext-style headings to paragraphs.
 */
export const disableSetextHeadings: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "heading", (node: HeadingNode) => {
      if (!node.data?.headingStyle) {
        addHeadingStyle(node);
      }
      // Convert setext heading nodes to paragraph nodes
      if (node.data?.headingStyle === "setext") {
        (node.type as string) = "paragraph";
        delete (node as Partial<HeadingNode>).depth;
        delete (node as DeepPartial<HeadingNode>).data?.setext;
      }
    });
  };
};
