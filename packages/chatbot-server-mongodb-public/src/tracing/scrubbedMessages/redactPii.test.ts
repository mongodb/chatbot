import { redactPii, Pii } from "./redactPii";

describe("redactPii", () => {
  it("should not modify text without PII", () => {
    const text =
      "This is a normal message about MongoDB aggregation framework.";
    const result = redactPii(text);

    expect(result.redactedText).toBe(text);
    expect(result.piiFound).toEqual([]);
  });

  it("should redact email addresses", () => {
    const text = "Please contact me at user@example.com for more information.";
    const result = redactPii(text);

    expect(result.redactedText).toContain("[EMAIL]");
    expect(result.redactedText).not.toContain("user@example.com");
    expect(result.piiFound).toContain("email");
  });

  it("should redact phone numbers", () => {
    const text = "Call me at 555-123-4567 or 555.123.4567 or 5551234567.";
    const result = redactPii(text);

    expect(result.redactedText).toContain("[PHONE]");
    expect(result.redactedText).not.toContain("555-123-4567");
    expect(result.redactedText).not.toContain("555.123.4567");
    expect(result.redactedText).not.toContain("5551234567");
    expect(result.piiFound).toContain("phone");
  });

  it("should redact addresses", () => {
    const text = "I live at 123 Main Street, Anytown, CA 12345.";
    const result = redactPii(text);

    expect(result.redactedText).toContain("[ADDRESS]");
    expect(result.redactedText).not.toContain("123 Main Street");
    expect(result.piiFound).toContain("address");
  });

  it("should redact credit card numbers", () => {
    const text =
      "My credit card is 4111-1111-1111-1111 and my Amex is 3782 822463 10005.";
    const result = redactPii(text);

    expect(result.redactedText).toContain("[CREDIT_CARD]");
    expect(result.redactedText).not.toContain("4111-1111-1111-1111");
    expect(result.redactedText).not.toContain("3782 822463 10005");
    expect(result.piiFound).toContain("credit_card");
  });

  it("should redact social security numbers", () => {
    const text = "My SSN is 123-45-6789.";
    const result = redactPii(text);

    expect(result.redactedText).toContain("[SSN]");
    expect(result.redactedText).not.toContain("123-45-6789");
    expect(result.piiFound).toContain("social_security");
  });

  it("should redact MongoDB connection URIs", () => {
    const text =
      "I'm using this connection string: mongodb://username:password@localhost:27017/mydatabase";
    const result = redactPii(text);

    expect(result.redactedText).toContain("mongodb://");
    expect(result.redactedText).toContain("<USERNAME>:<PASSWORD>");
    expect(result.redactedText).not.toContain("username:password");
    expect(result.piiFound).toContain("connection_uri");
  });

  it("should redact a single name", () => {
    const text = "Hello, my name is Aaron.";
    const result = redactPii(text);

    expect(result.redactedText).toContain("[NAME]");
    expect(result.redactedText).not.toContain("Aaron");
    expect(result.piiFound).toContain("name");
  });

  it("should redact multiple names in text", () => {
    const text = "Hello, I am Aaron and this is Abraham and Abby.";
    const result = redactPii(text);

    // Should replace all three names
    expect(result.redactedText).toBe(
      "Hello, I am [NAME] and this is [NAME] and [NAME]."
    );
    expect(result.piiFound).toContain("name");
    expect(result.piiFound.filter((type) => type === "name").length).toBe(1); // Only count 'name' once in piiFound
  });

  it("should redact names at the beginning and end of text", () => {
    const text = "Aaron is at the beginning and Abraham is in the middle and Abby is at the end";
    const result = redactPii(text);

    expect(result.redactedText).toContain("[NAME] is at the beginning");
    expect(result.redactedText).toContain("middle and [NAME] is at the end");
    expect(result.piiFound).toContain("name");
  });

  it("should handle names that are substrings of other words", () => {
    // 'Al' is in the wellKnownNames list
    const text = "The algorithm is working well.";
    const result = redactPii(text);

    // Should not replace 'Al' in 'algorithm'
    expect(result.redactedText).toBe("The algorithm is working well.");
    expect(result.piiFound).not.toContain("name");
  });

  it("should handle case-insensitive name matching", () => {
    const text = "This is aaron and ABRAHAM and Abby.";
    const result = redactPii(text);

    // Should replace all names regardless of case
    expect(result.redactedText).toBe("This is [NAME] and [NAME] and [NAME].");
    expect(result.piiFound).toContain("name");
  });

  it("should not redact when no names are present", () => {
    const text = "This text contains no known names.";
    const result = redactPii(text);

    expect(result.redactedText).toBe(text);
    expect(result.piiFound).not.toContain("name");
  });

  it("should redact multiple types of PII in the same text", () => {
    const text =
      "My name is Aaron, my email is john@example.com, my phone is 555-123-4567, " +
      "I live at 123 Main Street, my credit card is 4111-1111-1111-1111, my SSN is 123-45-6789, " +
      "and my MongoDB connection string is mongodb://admin:secretpassword@localhost:27017/admin";
    const result = redactPii(text);
    const expectedPii: Pii[] = [
      "name",
      "email",
      "phone",
      "address",
      "credit_card",
      "social_security",
      "connection_uri",
    ];

    expect(result.redactedText).toContain("[NAME]");
    expect(result.redactedText).toContain("[EMAIL]");
    expect(result.redactedText).toContain("[PHONE]");
    expect(result.redactedText).toContain("[ADDRESS]");
    expect(result.redactedText).toContain("[CREDIT_CARD]");
    expect(result.redactedText).toContain("[SSN]");
    expect(result.redactedText).toContain("<USERNAME>:<PASSWORD>");

    // Check that all expected PII types were found
    expectedPii.forEach((piiType) => {
      expect(result.piiFound).toContain(piiType);
    });

    // Check that the length of piiFound matches the expected length
    expect(result.piiFound.length).toBe(expectedPii.length);
  });
});
