// Suppress console.log statements
global.console = {
  ...console,
  log: jest.fn(),
};
