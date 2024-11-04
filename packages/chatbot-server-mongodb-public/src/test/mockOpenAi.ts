export const makeMockOpenAIToolCall = (funcRes: Record<string, unknown>) => {
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
