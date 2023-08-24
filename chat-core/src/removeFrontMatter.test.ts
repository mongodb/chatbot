import { removeFrontMatter } from "./removeFrontMatter";

describe("removeFrontMatter", () => {
  test("removes front matter if it exists", () => {
    const contentWithFrontmatter = `
---
title: My Blog Post
author: John Doe
date: 2023-08-15
---

This is the body of my blog post. Here you can write the actual content of the post.`;
    const contentWithoutFrontmatter = `This is the body of my blog post. Here you can write the actual content of the post.`;
    expect(removeFrontMatter(contentWithFrontmatter)).toBe(
      contentWithoutFrontmatter
    );
  });
  test("does not affect text without front matter", () => {
    const contentWithoutFrontmatter = `This is the body of my blog post. Here you can write the actual content of the post.`;
    expect(removeFrontMatter(contentWithoutFrontmatter)).toBe(
      contentWithoutFrontmatter
    );
  });
});
