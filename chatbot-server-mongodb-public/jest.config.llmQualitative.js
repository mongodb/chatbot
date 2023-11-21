module.exports = {
  preset: "ts-jest",
  setupFiles: ["<rootDir>/src/jestEnvSetUp.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/jestSetUp.ts"],
  testMatch: ["<rootDir>/src/llmQualitativeTests/**/*.test.ts"],
};
