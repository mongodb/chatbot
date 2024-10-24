import { extractCodeFromMarkdown } from "./extractCodeFromMarkdown";
describe("extractCodeFromMarkdown", () => {
  it("should remove code block with a specified language", () => {
    const input = `
\`\`\`javascript
console.log("Hello, World!");
\`\`\`
`;
    const expectedOutput = `console.log("Hello, World!");`;
    expect(extractCodeFromMarkdown(input)).toBe(expectedOutput);
  });

  it("should remove code block without a specified language", () => {
    const input = `
\`\`\`
const x = 10;
console.log(x);
\`\`\`
`;
    const expectedOutput = `const x = 10;\nconsole.log(x);`;
    expect(extractCodeFromMarkdown(input)).toBe(expectedOutput);
  });

  it("should handle multiple code blocks", () => {
    const input = `
Some text.

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

\`\`\`
const x = 10;
console.log(x);
\`\`\`
`;
    const expectedOutput = `console.log("Hello, World!");\n\nconst x = 10;\nconsole.log(x);`;
    expect(extractCodeFromMarkdown(input)).toBe(expectedOutput);
  });

  it("should return an empty string if no code block exists", () => {
    const input = `console.log("hi")`;
    const expectedOutput = input;
    expect(extractCodeFromMarkdown(input)).toBe(expectedOutput);
  });

  it("should handle edge cases with incomplete code block markers", () => {
    const input = `
\`\`\`javascript
console.log("Hello, World!");`;
    const expectedOutput = input;
    expect(extractCodeFromMarkdown(input)).toBe(expectedOutput);
  });

  it("should remove any non-codeblock content", () => {
    const input = `
This is some intro text.

\`\`\`python
print("Code block 1")
\`\`\`

Some more text here.

\`\`\`
console.log("Code block 2");
\`\`\`

The end.
`;
    const expectedOutput = `print("Code block 1")\n\nconsole.log("Code block 2");`;
    expect(extractCodeFromMarkdown(input)).toBe(expectedOutput);
  });
});
