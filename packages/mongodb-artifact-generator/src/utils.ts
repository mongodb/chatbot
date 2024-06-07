export function safeFileName(fileName: string) {
  return fileName.replace(/[/\\?%*:|"<>]/g, "-");
}

export function iOfN(i: number, n: number) {
  return `(${i + 1}/${n})`;
}

export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 Removes a string from the start of another string, if it is present.
 @returns The input string with the start string removed, if it was present
 */
export function removeStartOfString(str: string, start: string) {
  if (str.startsWith(start)) {
    return str.substring(start.length);
  }
  return str;
}
