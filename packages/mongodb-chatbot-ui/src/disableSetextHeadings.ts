import { visit } from "unist-util-visit";
import { Plugin } from "unified";
import { type Node } from "unist";

interface HeadingNode extends Node {
  type: "heading";
  depth: number;
  children: Node[];
}

const disableSetextHeadings: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "heading", (node: HeadingNode) => {
      if (node.depth < 3) {
        // Setext headings are levels 1 and 2
        (node.type as string) = "paragraph"; // Convert to paragraph
        delete (node as Partial<HeadingNode>).depth;
      }
    });
  };
};

export default disableSetextHeadings;
