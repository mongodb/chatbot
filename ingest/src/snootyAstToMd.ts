import { SnootyNode } from "./SnootyDataSource";

export type SnootyAstToMdOptions = {
  baseUrl: string;
};

// Adapted from https://github.com/mongodben/snooty-ast-to-md/blob/main/index.js
export const snootyAstToMd = (
  node: SnootyNode,
  options: SnootyAstToMdOptions,
  parentHeadingLevel = 0,
  text = ""
): string => {
  if (node.children === undefined) {
    // value nodes
    switch (node.type) {
      case "text":
        text += node.value;
        break;
      case "code":
        text += `\`\`\`${node.lang}\n${node.value}\n\`\`\`\n\n`;
        break;
      default:
        break;
    }
    return text;
  }

  // parent nodes
  switch (node.type) {
    case "section":
      if (node.children[0].type === "heading") {
        parentHeadingLevel++;
      }
      text += `${node.children
        .map((subnode) => snootyAstToMd(subnode, options, parentHeadingLevel))
        .join("")}\n\n`;
      break;
    case "heading":
      text += `${"#".repeat(parentHeadingLevel)} ${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel, text))
        .join("")}\n\n`;
      break;
    case "paragraph":
      text += `${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}\n\n`;
      break;
    case "list":
      text += node.children
        .map((listItem) => snootyAstToMd(listItem, options, parentHeadingLevel))
        .join("\n");
      break;
    case "listItem":
      text += `- ${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}`;
      break;
    // TODO: figure out ordered lists
    // TODO: figure out tables

    // recursive inline cases
    case "literal":
      text += `\`${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}\``;
      break;
    case "ref_role": {
      let url = "#"; // default if ref_role is something unexpected
      if (node.fileid !== undefined && Array.isArray(node.fileid)) {
        const [path, anchor] = node.fileid;
        url = `${options.baseUrl}${path}/#${anchor}`;
      } else if (node.url && typeof node.url === "string") {
        url = node.url;
      }

      text += `[${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}](${url})`;
      break;
    }
    case "emphasis":
      text += `*${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}*`;
      break;

    case "strong":
      text += `**${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}**`;
      break;

    case "target":
      // Ignore targets as they are not rendered
      break;

    default:
      text += node.children
        .map((subnode) => snootyAstToMd(subnode, options, parentHeadingLevel))
        .join("");
      break;
  }

  return text;
};
