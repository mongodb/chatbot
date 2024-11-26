import path from "path";

export function getPath() {
  const basePath = path.resolve(__dirname, "..", "..", "..", "..", "evalCases");
  return path.resolve(basePath, "included_links_conversations.yml");
}
