import { unified } from "unified";
import { type Node } from "unist";
import { visit } from "unist-util-visit";
import { headingStyle } from "./markdownHeadingStyle";

interface HeadingNode extends Node {
  type: "heading";
  depth: number;
  children: Node[];
  data?: {
    headingStyle?: string;
  };
}

const headingText = `
# This is an H1 (ATX)

Lorem ipsum.

## This is an H2 (ATX)

Dolor sit amet.

### This is an H3 (ATX)

consectetur adipiscing elit, sed do eiusmod tempor.

This is an H1 (Setext)
-------

This is an H2 (Setext)
=======

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
`;

describe("headingStyle plugin", () => {
  it("should mark headings as ATX or setext correctly", () => {
    const processor = unified().use(headingStyle);

    const tree = processor.parse(headingText) as Node;
    processor.runSync(tree);

    const headings: HeadingNode[] = [];
    visit(tree, "heading", (node: HeadingNode) => {
      headings.push(node);
    });

    expect(headings).toHaveLength(5);

    // ATX Headings
    expect(headings[0].data?.headingStyle).toBe("atx");
    expect(headings[1].data?.headingStyle).toBe("atx");
    expect(headings[2].data?.headingStyle).toBe("atx");

    // Setext Headings
    expect(headings[3].data?.headingStyle).toBe("setext");
    expect(headings[4].data?.headingStyle).toBe("setext");
  });
});
