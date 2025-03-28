import { redactMongoDbConnectionUri } from "./redactMongoDbConnectionUri";

describe("redactMongoDbConnectionUri", () => {
  it("should replace username and password with placeholders in standard MongoDB URI", () => {
    const uri = "mongodb://username:password@localhost:27017/database";
    const expected = "mongodb://<USERNAME>:<PASSWORD>@localhost:27017/database";
    expect(redactMongoDbConnectionUri(uri)).toBe(expected);
  });

  it("should replace username and password with placeholders in MongoDB+srv URI", () => {
    const uri =
      "mongodb+srv://admin:complex-passw0rd@cluster0.mongodb.net/database";
    const expected =
      "mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mongodb.net/database";
    expect(redactMongoDbConnectionUri(uri)).toBe(expected);
  });

  it("should not modify URIs without credentials", () => {
    const uri = "mongodb://localhost:27017/database";
    expect(redactMongoDbConnectionUri(uri)).toBe(uri);
  });

  it("should handle URIs with query parameters", () => {
    const uri =
      "mongodb://username:password@localhost:27017/database?retryWrites=true&w=majority";
    const expected =
      "mongodb://<USERNAME>:<PASSWORD>@localhost:27017/database?retryWrites=true&w=majority";
    expect(redactMongoDbConnectionUri(uri)).toBe(expected);
  });

  it("should handle URIs with multiple hosts", () => {
    const uri =
      "mongodb://username:password@host1:27017,host2:27017,host3:27017/database";
    const expected =
      "mongodb://<USERNAME>:<PASSWORD>@host1:27017,host2:27017,host3:27017/database";
    expect(redactMongoDbConnectionUri(uri)).toBe(expected);
  });

  it("should return the input string if it is not a MongoDB URI", () => {
    const notUri = "This is not a MongoDB URI";
    expect(redactMongoDbConnectionUri(notUri)).toBe(notUri);
  });
});
