module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/test/jestSetUp.ts"],
  testPathIgnorePatterns: ["<rootDir>/build"],
};
