/* eslint-disable @typescript-eslint/no-namespace */
import "jest";
declare global {
  namespace jest {
    interface Matchers<R> {
      /**
        For use with the LLM qualitative testing framework.
        @param expected - The expected output description
       */
      toMeetChatQualityStandard: (expected: string) => Promise<R>;
    }
  }
}
