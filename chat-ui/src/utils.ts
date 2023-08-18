function ensureArrayIndexInBounds<T>(arr: T[], index: number) {
  const isInBounds = index >= 0 && index < arr.length;
  if (!isInBounds) {
    throw new Error(
      `Index ${index} is out of bounds for array of length ${arr.length}`
    );
  }
}

/**
 * Immutable update of an array element at a given array index.
 *
 * @param arr - the array to update
 * @param index - the index of the element to update
 * @param value - the new value of the element
 */
export function updateArrayElementAt<T>(arr: T[], index: number, value: T) {
  ensureArrayIndexInBounds(arr, index);
  return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
}

/**
 * Immutable removal of an array element at a given array index.
 * @param arr - the array to update
 * @param index - the index of the element to remove
 * @throws if the index is out of bounds
 */
export function removeArrayElementAt<T>(arr: T[], index: number) {
  ensureArrayIndexInBounds(arr, index);
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

/**
 * Counts all occurences of a regular expression in a given string
 * @param regex - the pattern to count
 * @param str - the test string on which to evaluate the regex
 */
export function countRegexMatches(regex: RegExp, str: string) {
  const re = new RegExp(
    // Use the given regex pattern
    regex.source,
    // We need the global flag ("g") to count all occurences in the test string
    regex.flags.match(/g/) === null ? regex.flags + "g" : regex.flags
  );
  return (str.match(re) ?? []).length;
}
