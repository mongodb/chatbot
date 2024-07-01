import { ClassifiedChangelog } from "./classifyChangelog";

export type PrintableChangelog<
  Audience extends string = string,
  Scope extends string = string
> = `[${Audience} ${Scope}]: ${string}`;

export function createPrintableChangelog(
  c: ClassifiedChangelog
): PrintableChangelog {
  return `[${c.audience.type} ${c.scope.type}]: ${c.changelog}`;
}

export function parsePrintableChangelog(
  changelog: PrintableChangelog
): ClassifiedChangelog {
  const match = changelog.match(
    /^\[(?<audience>\w+) (?<scope>\w+)\]: (?<changelog>.+)$/
  );
  if (!match || match.groups === undefined) {
    throw new Error(`Invalid changelog: ${changelog}`);
  }

  return {
    audience: { type: match.groups.audience },
    scope: { type: match.groups.scope },
    changelog: match.groups.changelog,
  };
}
