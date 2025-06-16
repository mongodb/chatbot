export function tagify(s: string) {
  return s.replaceAll(/ /g, "_").toLowerCase();
}
