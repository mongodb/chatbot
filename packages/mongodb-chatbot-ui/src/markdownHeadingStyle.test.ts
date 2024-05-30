import { unified } from "unified";
import { type Node } from "unist";
import { visit } from "unist-util-visit";
import { headingStyle, disableSetextHeadings } from "./markdownHeadingStyle";
import remarkParse from "remark-parse";

interface HeadingNode extends Node {
  type: "heading";
  depth: number;
  children: Node[];
  data?: {
    headingStyle?: string;
  };
}

interface ParagraphNode extends Node {
  type: "paragraph";
  children: TextNode[];
}

interface TextNode extends Node {
  type: "text";
  value: string;
}

const headingText = `
# This is an H1 (ATX)

Lorem ipsum.

## This is an H2 (ATX)

Dolor sit amet.

### This is an H3 (ATX)

consectetur adipiscing elit, sed do eiusmod tempor.

This is an H1 (Setext)
=======

This is an H2 (Setext)
-------

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
`;

describe("headingStyle plugin", () => {
  it("should mark headings as ATX or Setext correctly", () => {
    const processor = unified().use(remarkParse).use(headingStyle);

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

describe("disableSetextHeadings", () => {
  it("implements the headingStyle plugin if it's not explicitly added", () => {
    const implicitProcessor = unified()
      .use(remarkParse)
      .use(disableSetextHeadings);

    const explicitProcessor = unified()
      .use(remarkParse)
      .use(headingStyle)
      .use(disableSetextHeadings);

    expect(() => {
      const tree = implicitProcessor.parse(headingText) as Node;
      implicitProcessor.runSync(tree);
    }).not.toThrow();

    expect(() => {
      const tree = explicitProcessor.parse(headingText) as Node;
      explicitProcessor.runSync(tree);
    }).not.toThrow();
  });

  it("converts setext heading nodes into paragraph nodes", () => {
    const processor = unified()
      .use(remarkParse)
      .use(headingStyle)
      .use(disableSetextHeadings);
    const tree = processor.parse(headingText) as Node;
    processor.runSync(tree);

    const headings: HeadingNode[] = [];
    visit(tree, "heading", (node: HeadingNode) => {
      headings.push(node);
    });
    const paragraphs: ParagraphNode[] = [];
    visit(tree, "paragraph", (node: ParagraphNode) => {
      paragraphs.push(node);
    });

    // ATX Headings
    expect(headings).toHaveLength(3);
    expect(headings[0].data?.headingStyle).toBe("atx");
    expect(headings[1].data?.headingStyle).toBe("atx");
    expect(headings[2].data?.headingStyle).toBe("atx");

    // Setext Headings
    expect(paragraphs).toHaveLength(6);
    expect(paragraphs[3].children[0].value).toBe("This is an H1 (Setext)");
    expect(paragraphs[4].children[0].value).toBe("This is an H2 (Setext)");
  });
});
