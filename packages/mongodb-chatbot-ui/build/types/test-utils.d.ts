export type MockFetchResultArgs<T> = {
    ok?: boolean;
    status?: number;
    json: T;
};
/**
  Mock the next global.fetch result.
 */
export declare function mockNextFetchResult<T>({ ok, status, json, }: MockFetchResultArgs<T>): void;
