/**
 * Immutable update of an array element at a given array index.
 *
 * @param arr - the array to update
 * @param index - the index of the element to update
 * @param value - the new value of the element
 * @returns
 */
export function updateArrayElementAt<T>(arr: T[], index: number, value: T) {
  if(index < 0 || index >= arr.length) {
    throw new Error(`Index ${index} is out of bounds for array of length ${arr.length}`);
  }
  return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
}
