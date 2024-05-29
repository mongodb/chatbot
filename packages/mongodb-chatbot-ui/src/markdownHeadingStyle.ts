import { visit } from "unist-util-visit";
import { Plugin } from "unified";
import { type Node } from "unist";

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

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
  A unified plugin that analyzes headings and marks them as ATX-style headings or setext-style headings.
 */
export const headingStyle: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "heading", (node: HeadingNode) => {
      // Assume ATX by default
      node.data = { headingStyle: "atx" };
      // Check if the heading is actually a setext-style heading
      if (node.depth < 3 && node.position !== undefined) {
        if (node.position.start.line !== node.position.end.line) {
          node.data = { headingStyle: "setext" };
        }
      }
    });
  };
};

/**
  A unified plugin that converts setext-style headings to paragraphs.
  This plugin should be run after `headingStyle`.
 */
export const disableSetextHeadings: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "heading", (node: HeadingStyleNode) => {
      console.log("before", node);
      if (node.data.headingStyle === "setext") {
        // Convert to paragraph
        (node.type as string) = "paragraph";
        delete (node as Partial<HeadingNode>).depth;
        delete (node as DeepPartial<HeadingNode>).data?.setext;
      }
      console.log("after", node);
    });
  };
};
