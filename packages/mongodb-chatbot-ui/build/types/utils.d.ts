/**
 * Immutable update of an array element at a given array index.
 *
 * @param arr - the array to update
 * @param index - the index of the element to update
 * @param value - the new value of the element
 */
export declare function updateArrayElementAt<T>(arr: T[], index: number, value: T): T[];
/**
 * Immutable removal of an array element at a given array index.
 * @param arr - the array to update
 * @param index - the index of the element to remove
 * @throws if the index is out of bounds
 */
export declare function removeArrayElementAt<T>(arr: T[], index: number): T[];
/**
 * Counts all occurences of a regular expression in a given string
 * @param regex - the pattern to count
 * @param str - the test string on which to evaluate the regex
 */
export declare function countRegexMatches(regex: RegExp, str: string): number;
/**
 * Checks if the browser supports Server-Sent Events.
 * @returns true if the browser supports Server-Sent Events, false otherwise
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
 * @see https://caniuse.com/eventsource
 */
export declare const canUseServerSentEvents: () => boolean;
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
export declare function addQueryParams(url: string, params: Record<string, string | undefined>): string;
/**
 * In a browser environment, returns the current page URL. If `window` is not available (e.g. in a Node.js environment), returns `undefined`.
 */
export declare function getCurrentPageUrl(): URL | undefined;
/**
  Flatten an array. Equivalent to Array.prototype.flat()

  @example Flatten<["abc", ["def", ["g", "h"], "i"], "j", [], ["k"]]> => ["abc", "def", "g", "h", "i", "j", "k"]
 */
export type Flatten<T extends unknown[]> = T extends [infer Head, ...infer Tail] ? Head extends unknown[] ? [...Flatten<Head>, ...Flatten<Tail>] : [Head, ...Flatten<Tail>] : [];
/**
  Returns the provided type but with some fields renamed.
  @example RenameFields<{ id: string, name: string, date: Date }, { name: "username", date: "createdAt" }> => { id: string, username: string, createdAt: Date }
 */
export type RenameFields<T extends object, Renames extends Partial<Record<keyof T, string>>> = {
    [K in keyof T as K extends keyof Renames ? Renames[K] extends string ? Renames[K] : K : K]: T[K];
};
export declare function renameFields<T extends object, Renames extends Partial<Record<keyof T, string>>>(t: T, renames: Renames): RenameFields<T, Renames>;
export declare function omit<T extends Record<string, unknown>, OmitFields extends (keyof T)[]>(t: T, omitFields: OmitFields): Omit<T, OmitFields[number]>;
/**
 * Like the built-in `Partial` type, but it applies recursively to all nested fields.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? DeepPartial<U>[] : T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export declare function isProductionBuild(): boolean;
/**
  A function that only runs if we're not in a production build.
 */
export declare function nonProd(fn: () => void): void;
