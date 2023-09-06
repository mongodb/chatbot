import { SnootyNode } from "./SnootyDataSource";
import { strict as assert } from "assert";
import { renderSnootyTable } from "./renderSnootyTable";

export const snootyAstToMd = (
  node: SnootyNode,
  parentHeadingLevel = 0,
  text = ""
): string => {
  // Base cases (terminal nodes)
  if (node.children === undefined) {
    // value nodes
    switch (node.type) {
      case "text":
        text +=
          typeof node.value === "string"
            ? node.value
                .replaceAll(/(\S)\n/g, "$1 ")
                .replaceAll(/\n(\S)/g, " $1")
            : node.value;
        break;
      case "code":
        text += `\`\`\`${node.lang || ""}\n${node.value}\n\`\`\`\n\n`;
        break;

      default:
        break;
    }
    return text;
  }
  // Just render line break for target_identifier
  if (node.type === "target_identifier") {
    return text + `\n`;
  }

  // parent nodes
  switch (node.type) {
    case "comment":
      // Do not render comments
      break;
    case "section":
      if (node.children[0].type === "heading") {
        parentHeadingLevel++;
      }
      text += `${node.children
        .map((subnode) => snootyAstToMd(subnode, parentHeadingLevel))
        .join("")}\n\n`;
      break;
    case "heading":
      text += `${"#".repeat(parentHeadingLevel)} ${node.children
        .map((child) => snootyAstToMd(child, parentHeadingLevel))
        .join("")}\n\n`;
      break;
    case "paragraph":
      text += `${node.children
        .map((child) => snootyAstToMd(child, parentHeadingLevel))
        .join("")}\n\n`;
      break;
    case "list":
      text += node.children
        .map((listItem) => snootyAstToMd(listItem, parentHeadingLevel))
        .join("\n");
      break;
    case "listItem":
      text += `- ${node.children
        .map((child) => snootyAstToMd(child, parentHeadingLevel))
        .join("")}`;
      break;
    // TODO: figure out ordered lists

    // recursive inline cases
    case "literal":
      text += `\`${node.children
        .map((child) => snootyAstToMd(child, parentHeadingLevel))
        .join("")}\``;
      break;
    case "directive":
      text += handleDirective(node, parentHeadingLevel);
      break;
    // No longer including links
    // case "ref_role": {
    //   let url = "#"; // default if ref_role is something unexpected
    //   if (node.fileid !== undefined && Array.isArray(node.fileid)) {
    //     const [path, anchor] = node.fileid;
    //     url = `${options.baseUrl}${path}/#${anchor}`;
    //   } else if (node.url && typeof node.url === "string") {
    //     url = node.url;
    //   }
    //   text += `[${node.children
    //     .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
    //     .join("")}](${url})`;
    //   break;
    // }
    case "emphasis":
      text += `*${node.children
        .map((child) => snootyAstToMd(child, parentHeadingLevel))
        .join("")}*`;
      break;

    case "strong":
      text += `**${node.children
        .map((child) => snootyAstToMd(child, parentHeadingLevel))
        .join("")}**`;
      break;

    default:
      text += node.children
        .map((subnode) => snootyAstToMd(subnode, parentHeadingLevel))
        .join("");
      break;
  }

  return text.replaceAll(/\n{3,}/g, "\n\n").trimStart(); // remove extra newlines with just 2
};

/**
  Helper function to handle directives. Directives are special nodes that
  contain a variety of different content types.
 */
const handleDirective = (node: SnootyNode, parentHeadingLevel: number) => {
  assert(
    node.children,
    "This function should only be called if node has children"
  );
  switch (node.name) {
    case "list-table":
      return renderSnootyTable(node, parentHeadingLevel);
    case "tab": {
      const tabName = (
        node.argument && Array.isArray(node.argument) && node.argument.length
          ? node.argument.find((arg) => arg.type === "text")?.value ?? ""
          : ""
      ).trim();
      return `\n\n<Tab ${`name="${tabName ?? ""}"`}>\n\n${node.children
        .map((child) => snootyAstToMd(child, parentHeadingLevel))
        .join("")}\n\n</Tab>\n\n`;
    }
    case "tabs" || "tabs-drivers":
      return `\n\n<Tabs>\n\n${node.children
        .map((child) => snootyAstToMd(child, parentHeadingLevel))
        .join("")}\n\n</Tabs>\n\n`;
    default:
      return node.children
        .map((subnode) => snootyAstToMd(subnode, parentHeadingLevel))
        .join("");
  }
};

const findNode = (
  node: SnootyNode,
  predicate: (node: SnootyNode) => boolean
): SnootyNode | undefined => {
  if (predicate(node)) {
    return node;
  }
  for (const child of node.children ?? []) {
    const result = findNode(child, predicate);
    if (result) {
      return result;
    }
  }
  return undefined;
};

export const getTitleFromSnootyAst = (node: SnootyNode): string | undefined => {
  const firstHeading = findNode(node, ({ type }) => type === "heading");
  if (!firstHeading) {
    return undefined;
  }
  const textNode = findNode(firstHeading, ({ type }) => type === "text");
  return textNode?.value as string;
};
