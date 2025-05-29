import {
  guardrailFailedResult,
  InputGuardrailResult,
  withAbortControllerGuardrail,
} from "./InputGuardrail";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("withAbortControllerGuardrail", () => {
  const mockResult = { success: true };
  const mockFn = jest
    .fn()
    .mockImplementation(async (abortController: AbortController) => {
      await sleep(100);
      if (abortController.signal.aborted) {
        return null;
      }
      return mockResult;
    });

  const mockGuardrailRejectedResult: InputGuardrailResult = {
    rejected: true,
    reason: "Input rejected",
    metadata: { source: "test" },
  };

  const mockGuardrailApprovedResult: InputGuardrailResult = {
    rejected: false,
    reason: "Input approved",
    metadata: { source: "test" },
  };

  const makeMockGuardrail = (pass: boolean) => {
    return pass
      ? Promise.resolve(mockGuardrailApprovedResult)
      : Promise.resolve(mockGuardrailRejectedResult);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return result when main function completes successfully without guardrail", async () => {
    const result = await withAbortControllerGuardrail(mockFn);

    expect(result).toEqual({
      result: mockResult,
      guardrailResult: undefined,
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should return both results when guardrail approves the input", async () => {
    const result = await withAbortControllerGuardrail(
      mockFn,
      makeMockGuardrail(true)
    );

    expect(result).toEqual({
      result: mockResult,
      guardrailResult: mockGuardrailApprovedResult,
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should abort main function when guardrail rejects input", async () => {
    const mockFn = jest.fn().mockImplementation(async (abortController) => {
      return new Promise((resolve) => {
        // Sleep for 100ms to simulate async operation
        setTimeout(() => {
          if (abortController.signal.aborted) {
            resolve(null);
          } else {
            resolve(mockResult);
          }
        }, 100);
      });
    });

    // Create a guardrail result that rejects
    const mockGuardrailResult: InputGuardrailResult = {
      rejected: true,
      reason: "Input rejected",
      metadata: { source: "test" },
    };
    const guardrailPromise = Promise.resolve(mockGuardrailResult);

    const result = await withAbortControllerGuardrail(mockFn, guardrailPromise);

    expect(result).toEqual({
      result: null,
      guardrailResult: mockGuardrailResult,
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should propagate errors from main function", async () => {
    const mockError = new Error("Test error");
    const errorMockFn = jest.fn().mockImplementation(async () => {
      throw mockError;
    });

    await expect(withAbortControllerGuardrail(errorMockFn)).rejects.toThrow(
      mockError
    );
    expect(errorMockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle rejected guardrail promise", async () => {
    const guardrailError = new Error("Guardrail error");
    const guardrailPromise = Promise.reject(guardrailError);
    const { result, guardrailResult } = await withAbortControllerGuardrail(
      mockFn,
      guardrailPromise
    );

    expect(result).toBeNull();
    expect(guardrailResult).toMatchObject({
      ...guardrailFailedResult,
      metadata: { error: guardrailError },
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle guardrail completing after main function", async () => {
    // Create a guardrail that resolves after a delay
    const delayedGuardrailPromise = new Promise<InputGuardrailResult>(
      (resolve) => {
        setTimeout(() => resolve(mockGuardrailApprovedResult), 50);
      }
    );

    const result = await withAbortControllerGuardrail(
      mockFn,
      delayedGuardrailPromise
    );

    expect(result).toEqual({
      result: mockResult,
      guardrailResult: mockGuardrailApprovedResult,
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("guardrail aborts but main function still resolves", async () => {
    // Create a mock function that checks abort signal but completes anyway
    // Define a type that includes the wasAborted property
    type MockResultWithAbort = { success: boolean; wasAborted: boolean };

    const mockFnIgnoresAbort = jest
      .fn()
      .mockImplementation(async (abortController) => {
        return new Promise<MockResultWithAbort>((resolve) => {
          setTimeout(() => {
            // Log that abort was triggered but complete anyway
            const wasAborted = abortController.signal.aborted;
            // Still return a result even if aborted
            resolve({ success: true, wasAborted });
          }, 10);
        });
      });

    const result = await withAbortControllerGuardrail<MockResultWithAbort>(
      mockFnIgnoresAbort,
      makeMockGuardrail(false)
    );

    // The main function should complete with a result despite abort
    expect(result.result).not.toBeNull();
    if (result.result) {
      expect(result.result.wasAborted).toBe(true);
    }
    expect(result.guardrailResult).toEqual(mockGuardrailRejectedResult);
    expect(mockFnIgnoresAbort).toHaveBeenCalledTimes(1);
  });
});
