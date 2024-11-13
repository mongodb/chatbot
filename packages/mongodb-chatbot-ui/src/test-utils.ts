import { vi } from "vitest";

export type MockFetchResultArgs<T> = {
  ok?: boolean;
  status?: number;
  json: T;
};

/**
  Mock the next global.fetch result.
 */
export function mockNextFetchResult<T>({
  ok = true,
  status = 200,
  json,
}: MockFetchResultArgs<T>) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: async () => json,
  });
}
