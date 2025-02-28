import { splitDiff } from "./splitDiff";

const diff = `
diff --git a/file1 b/file1
index 0000000..1111111 100644
--- a/file1
+++ b/file1
@@ -1,2 +1,2 @@
-foo
+bar
+baz
diff --git a/file2 b/file2
index 222222..333333 100644
--- a/file2
+++ b/file2
@@ -1,2 +1,2 @@
-hello, world
+wassup, world
`.trim();

describe("splitDiff", () => {
  it("splits a git diff by file & identifies its parts", () => {
    const diffParts = splitDiff(diff);

    expect(diffParts.length).toEqual(2);

    expect(diffParts[0].fileName).toEqual("file1");
    expect(diffParts[0].diff).toEqual(
      `diff --git a/file1 b/file1\nindex 0000000..1111111 100644\n--- a/file1\n+++ b/file1\n@@ -1,2 +1,2 @@\n-foo\n+bar\n+baz\n`,
    );

    expect(diffParts[1].fileName).toEqual("file2");
    expect(diffParts[1].diff).toEqual(
      `diff --git a/file2 b/file2\nindex 222222..333333 100644\n--- a/file2\n+++ b/file2\n@@ -1,2 +1,2 @@\n-hello, world\n+wassup, world\n`,
    );
  });
});
