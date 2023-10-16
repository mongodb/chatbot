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

/**
 * Checks if the browser supports Server-Sent Events.
 * @returns true if the browser supports Server-Sent Events, false otherwise
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
 * @see https://caniuse.com/eventsource
 */
export const canUseServerSentEvents = () => typeof EventSource !== "undefined";

/**
 * A shared interface for Emotion CSS tag constructors.
 * @see https://emotion.sh/docs/typescript#css-tag
 */
export interface StylesProps {
  darkMode?: boolean;
}

/**
 * Adds additional query params to a url while preserving any existing params.
 *
 * @param url - The url to add the query params to
 * @param params - An object of params to add that maps param keys to values.
 * @returns - The url with the query params added
 */
export function addQueryParams(url: string, params: Record<string, string>) {
  const urlObj = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    urlObj.searchParams.append(key, value);
  }
  return urlObj.toString();
}
