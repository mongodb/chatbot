export const makeMockOpenAIToolCall = (funcRes: Record<string, unknown>) => {
  // This module is also required for the mock to work
  // in the tests
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    tool_calls: [
                      {
                        function: {
                          arguments: JSON.stringify(funcRes),
                        },
                      },
                    ],
                  },
                },
              ],
            }),
          },
        },
      };
    }),
  };
};
