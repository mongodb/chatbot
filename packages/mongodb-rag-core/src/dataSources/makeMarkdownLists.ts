export function makeMarkdownNumberedList(items: string[]) {
  return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
}

export function makeMarkdownUnorderedList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}
