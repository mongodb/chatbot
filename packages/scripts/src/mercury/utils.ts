export function diffLists<T, ParsedT = T>(list1: T[], list2: T[]): ParsedT[] {
  const set1 = new Set(list1.map((x) => JSON.stringify(x)));
  const set2 = new Set(list2.map((x) => JSON.stringify(x)));
  return [...set1.difference(set2)].map((x) => JSON.parse(x)) as ParsedT[];
}

export function truncateString(str: string, maxLength: number) {
  return str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str;
}
