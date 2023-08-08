import { SnootyNode } from "./SnootyDataSource";

enum TableMode {
  IN_TABLE = 0,
  IN_ROW,
  IN_COLUMN,
}

export type SnootyAstToMdOptions = {
  baseUrl: string;
  table?: {
    mode: TableMode;
    needsHeaderRow: boolean;
  };
};

export const snootyAstToMd = (
  node: SnootyNode,
  options: SnootyAstToMdOptions,
  parentHeadingLevel = 0,
  text = ""
): string => {
  const { table } = options;
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
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}\n\n`;
      break;
    case "paragraph":
      text += `${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}\n\n`;
      break;
    case "list":
      if (table && table.mode < TableMode.IN_COLUMN) {
        const tag =
          table.mode === TableMode.IN_TABLE
            ? "tr"
            : table.needsHeaderRow
            ? "th"
            : "td";
        text += node.children
          .map((listItem, i) => {
            return [
              `<${tag}>`,
              snootyAstToMd(
                listItem,
                {
                  ...options,
                  // Advance table mode to next mode:
                  // - from <table> (IN_TABLE) --> <tr> (IN_ROW)
                  // - OR from <tr> (IN_ROW) --> <td> (IN_COLUMN)
                  table: {
                    mode: table.mode + 1,
                    needsHeaderRow:
                      // (Hacky) Set "needsHeaderRow" to false after the first row
                      table.mode === TableMode.IN_TABLE && i > 0
                        ? false
                        : table.needsHeaderRow,
                  },
                },
                parentHeadingLevel
              ),
              `</${tag}>`,
            ].join("\n");
          })
          .join("\n");
      } else {
        text += node.children
          .map((listItem) =>
            snootyAstToMd(
              listItem,
              {
                ...options,

                // Clear table if already IN_COLUMN
                table: undefined,
              },
              parentHeadingLevel
            )
          )
          .join("\n");
      }
      break;
    case "listItem":
      if (options.table) {
        // Table information in snooty AST is expressed in terms of
        // lists/listItems under a list-table directive
        text += node.children
          .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
          .join("");
      } else {
        // Actual list
        text += `- ${node.children
          .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
          .join("")}`;
      }
      break;
    // TODO: figure out ordered lists

    // recursive inline cases
    case "literal":
      text += `\`${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}\``;
      break;
    case "directive":
      if (node.name === "list-table") {
        const directiveOptions = (node as { options?: Record<string, unknown> })
          .options;
        const needsHeaderRow = directiveOptions
          ? directiveOptions["header-rows"] === 1
          : false;
        text += [
          "<table>",
          node.children
            .map((child) =>
              snootyAstToMd(
                child,
                {
                  ...options,
                  table: {
                    mode: TableMode.IN_TABLE,
                    needsHeaderRow,
                  },
                },
                parentHeadingLevel
              )
            )
            .join(""),
          "</table>",
        ].join("\n");
      } else {
        // other "directive" nodes not parsed in particular way
        text += node.children
          .map((subnode) => snootyAstToMd(subnode, options, parentHeadingLevel))
          .join("");
      }
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
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}*`;
      break;

    case "strong":
      text += `**${node.children
        .map((child) => snootyAstToMd(child, options, parentHeadingLevel))
        .join("")}**`;
      break;

    default:
      text += node.children
        .map((subnode) => snootyAstToMd(subnode, options, parentHeadingLevel))
        .join("");
      break;
  }

  return text.replaceAll(/\n{3,}/g, "\n\n").trimStart(); // remove extra newlines with just 2
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
