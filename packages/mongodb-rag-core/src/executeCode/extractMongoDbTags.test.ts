import {
  extractMongoDbMethods,
  extractMongoDbQueryOperators,
} from "./extractMongoDbTags";

describe("extractMongoDbMethods", () => {
  it("should extract MongoDB methods from code", () => {
    const code = `
      const result = await collection.find({ age: { $gt: 18 } });
    `;

    const methods = extractMongoDbMethods(code);
    expect(methods).toEqual(["find"]);
  });

  it("should extract methods with whitespace before parentheses", () => {
    const code = `
      const result = await collection.find ({ age: { $gt: 18 } });
    `;

    const methods = extractMongoDbMethods(code);
    expect(methods).toEqual(["find"]);
  });

  it("should extract methods from method chaining", () => {
    const code = `
      const result = await collection.find({ age: { $gt: 18 } }).sort({ name: 1 }).limit(10);
    `;

    const methods = extractMongoDbMethods(code);
    expect(methods.sort()).toEqual(["find", "limit", "sort"].sort());
  });

  it("should extract multiple occurrences of the same method only once", () => {
    const code = `
      const result1 = await collection.find({ age: { $gt: 18 } });
      const result2 = await collection.find({ name: "John" });
    `;

    const methods = extractMongoDbMethods(code);
    expect(methods).toEqual(["find"]);
  });

  it("should extract multiple different methods", () => {
    const code = `
      const result1 = await collection.find({ age: { $gt: 18 } });
      const result2 = await collection.insertOne({ name: "John", age: 25 });
      const result3 = await collection.updateMany({ age: { $lt: 18 } }, { $set: { minor: true } });
    `;

    const methods = extractMongoDbMethods(code);
    expect(methods.sort()).toEqual(["find", "insertOne", "updateMany"].sort());
  });

  it("should not extract methods that aren't in the MongoDB methods list", () => {
    const code = `
      const result = await collection.customMethod({ age: { $gt: 18 } });
    `;

    const methods = extractMongoDbMethods(code);
    expect(methods).toEqual([]);
  });

  it("should return an empty array when no MongoDB methods are found", () => {
    const code = `
      const x = 1 + 2;
      console.log('Hello, world!');
      function add(a, b) { return a + b; }
    `;

    const methods = extractMongoDbMethods(code);
    expect(methods).toEqual([]);
  });

  it("should handle empty input", () => {
    const methods = extractMongoDbMethods("");
    expect(methods).toEqual([]);
  });
});

describe("extractMongoDbQueryOperators", () => {
  it("should extract MongoDB query operators from code", () => {
    const code = `
      const query = { age: { $gt: 18, $lt: 65 } };
      const result = await collection.find(query);
    `;

    const operators = extractMongoDbQueryOperators(code);
    expect(operators.sort()).toEqual(["$gt", "$lt"].sort());
  });

  it("should extract MongoDB operators from aggregation pipeline", () => {
    const code = `
      const pipeline = [
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ];
      const result = await collection.aggregate(pipeline);
    `;

    const operators = extractMongoDbQueryOperators(code);
    expect(operators.sort()).toEqual(
      ["$match", "$group", "$sort", "$sum"].sort()
    );
  });

  it("should extract MongoDB operators from update operations", () => {
    const code = `
      await collection.updateOne(
        { _id: userId },
        { 
          $set: { lastLogin: new Date() },
          $inc: { loginCount: 1 },
          $push: { loginHistory: new Date() }
        }
      );
    `;

    const operators = extractMongoDbQueryOperators(code);
    expect(operators.sort()).toEqual(["$set", "$inc", "$push"].sort());
  });

  it("should extract operators with both single and double quotes", () => {
    const code = `
      const pipeline = [
        { '$match': { status: 'active' } },
        { "$group": { _id: "$category", total: { "$sum": 1 } } }
      ];
    `;

    const operators = extractMongoDbQueryOperators(code);
    expect(operators.sort()).toEqual(["$match", "$group", "$sum"].sort());
  });

  it("should extract operators used as field names", () => {
    const code = `
      const pipeline = [
        { $group: { _id: "$category" } }
      ];
    `;

    const operators = extractMongoDbQueryOperators(code);
    expect(operators.sort()).toEqual(["$group"].sort());
  });

  it("should extract multiple occurrences of the same operator only once", () => {
    const code = `
      const updates = [
        { $set: { status: 'active' } },
        { $set: { updatedAt: new Date() } }
      ];
    `;

    const operators = extractMongoDbQueryOperators(code);
    expect(operators).toEqual(["$set"]);
  });

  it("should not extract operators from string literals that aren't in MongoDB context", () => {
    const code = `
      // These are strings that look like operators but aren't in MongoDB context
      const operatorName = "$match";
      console.log("The operator is: $group");
      // This is an actual operator in context
      const query = { age: { $gt: 21 } };
    `;

    const operators = extractMongoDbQueryOperators(code);
    expect(operators).toEqual(["$gt"]);
  });

  it("should return an empty array when no MongoDB operators are found", () => {
    const code = `
      // No MongoDB operators here
      const x = 1 + 2;
      console.log('Hello, world!');
      function add(a, b) { return a + b; }
    `;

    const operators = extractMongoDbQueryOperators(code);
    expect(operators).toEqual([]);
  });

  it("should handle empty input", () => {
    const operators = extractMongoDbQueryOperators("");
    expect(operators).toEqual([]);
  });
});
