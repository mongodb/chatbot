import { ClassifiedChangelog } from "./classifyChangelog";
import { title as titleCase } from "case";

export function formatChangelogsRst(changelogs: ClassifiedChangelog[]) {
  // Filter out internal changes
  const externalChangelogs = changelogs.filter(
    (c) => c.audience.type !== "internal"
  );
  // Group by scope
  const groupedChangelogs = externalChangelogs.reduce((acc, c) => {
    if (!acc[c.scope.type]) {
      acc[c.scope.type] = [];
    }
    acc[c.scope.type].push(c);
    return acc;
  }, {} as Record<string, ClassifiedChangelog[]>);
  // Format each group
  const formattedChangelogs = Object.entries(groupedChangelogs)
    .map(([scope, changelogs]) => {
      const formattedScope = `**${titleCase(scope)}**\n`;
      const formattedChangelogs = changelogs.map((c) => {
        return `- ${c.changelog}`;
      });
      return [formattedScope, ...formattedChangelogs].join("\n");
    })
    .join("\n\n");

  return formattedChangelogs;
}
