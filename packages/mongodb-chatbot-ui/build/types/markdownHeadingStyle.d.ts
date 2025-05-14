import { Plugin } from "unified";
import { type Node } from "unist";
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
export declare function addHeadingStyle(node: HeadingNode): void;
/**
  A unified plugin that analyzes headings and marks them as ATX-style headings or setext-style headings.
 */
export declare const headingStyle: Plugin;
/**
  A unified plugin that converts setext-style headings to paragraphs.
 */
export declare const disableSetextHeadings: Plugin;
