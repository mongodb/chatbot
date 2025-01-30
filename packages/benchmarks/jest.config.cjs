module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/build"],
  verbose: true,
  globalSetup: "<rootDir>/src/test/globalSetup.ts",
  globalTeardown: "<rootDir>/src/test/globalTeardown.ts",
};
