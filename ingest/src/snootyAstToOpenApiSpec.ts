import yaml from "yaml";
import { SnootyNode } from "./SnootyDataSource";

export const snootyAstToOpenApiSpec = (node: SnootyNode): string => {
  if (node.name === "openapi") {
    if (
      node.children &&
      node.children.length > 0 &&
      node.children[0].type === "text"
    ) {
      const jsonSpecString = node.children[0].value as string;
      const text = yaml.stringify(JSON.parse(jsonSpecString));
      return cleanSpec(text);
      // TODO: figure out how to get specs when they're remotely hosted (like Atlas Admin API)
    } else {
      return "";
    }
  }
  return (
    node.children
      ?.map((childNode) => snootyAstToOpenApiSpec(childNode))
      .join("") || ""
  );
};

function cleanSpec(spec: string): string {
  return spec
    .replaceAll("\n\n", "\n") // remove unnecessary double newlines
    .replaceAll(/\[([^[\]]+?)\]\(.*?\)/g, (_, text) => text); // replace markdown links with just the text
}

export const getTitleFromSnootyOpenApiSpecAst = (
  node: SnootyNode
): string | undefined => {
  if (node.options?.template === "openapi") {
    return node.options?.title as string;
  }
  return (
    node.children
      ?.map((childNode) => snootyAstToOpenApiSpec(childNode))
      .join("") || ""
  );
};
