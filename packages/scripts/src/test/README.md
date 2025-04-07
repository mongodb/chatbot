# Testing in the Scripts Package

This directory contains test setup files and utilities for the scripts package.

## Testing Approach

The scripts package uses Jest as the testing framework and MongoDB Memory Server to create an in-memory MongoDB instance for testing database operations without requiring an actual MongoDB server.

### Test Setup Files

- `constants.ts`: Contains constants used in the test setup, such as IP addresses and ports.
- `globalSetup.ts`: Sets up the MongoDB Memory Server before tests run.
- `globalTeardown.ts`: Cleans up the MongoDB Memory Server after tests complete.
- `jestSetUp.ts`: Contains Jest-specific setup code, such as timeout configurations.

### Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- <test-file-name>
```

For example:

```bash
npm test -- scrubMessages
```

## Testing Database Operations

When testing database operations, we use the MongoDB Memory Server to create an isolated MongoDB instance for each test suite. This approach has several advantages:

1. Tests run in isolation without affecting a real database.
2. No need to set up and maintain a separate test database.
3. Tests can run in parallel without conflicts.
4. Tests are faster since they use an in-memory database.****

### Example: Testing Database Operations

Here's a basic pattern for testing database operations:

```typescript
import { MongoClient, Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Database operations", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    // Start MongoDB in-memory server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = await MongoClient.connect(uri);
    db = client.db("test");
  });

  afterAll(async () => {
    // Clean up resources
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await db.collection("your_collection").deleteMany({});
  });

  it("should perform a database operation", async () => {
    // Arrange: Set up test data
    await db.collection("your_collection").insertOne({ test: "data" });

    // Act: Call the function that performs the database operation
    const result = await yourFunction({ db });

    // Assert: Check the results
    expect(result).toBeDefined();
    // Add more assertions as needed
  });
});
```

## Mocking

For tests that don't need to interact with a database or when you want to test error handling, you can use Jest's mocking capabilities:

```typescript
it("should handle errors gracefully", async () => {
  // Create a spy on console.error to verify it's called
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

  // Create a mock db with a collection that throws an error
  const mockDb = {
    collection: jest.fn().mockReturnValue({
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockRejectedValue(new Error("Test error")),
      }),
    }),
  };

  // Act: Call the function with the mock db
  await yourFunction({ db: mockDb as unknown as Db });

  // Assert: Error should be caught and logged
  expect(consoleErrorSpy).toHaveBeenCalled();

  // Clean up
  consoleErrorSpy.mockRestore();
});
```


## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from other tests.
2. **Clean up**: Always clean up resources in `afterAll` and reset state in `beforeEach`.
3. **Descriptive names**: Use descriptive test names that explain what is being tested.
4. **Arrange-Act-Assert**: Structure tests with clear arrange, act, and assert sections.
5. **Test edge cases**: Include tests for error conditions and edge cases.
6. **Avoid test interdependence**: Tests should not depend on each other's execution order. 
