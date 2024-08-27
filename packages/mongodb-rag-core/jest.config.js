module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/test/jestEnvSetUp.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/test/jestSetUp.ts"],
  testPathIgnorePatterns: ["<rootDir>/build"],
};
