import { embedder, embeddedContentStore } from "../test/testConfig";
import { makeDefaultFindContent } from "./makeDefaultFindContent";

describe("makeDefaultFindContent()", () => {
  const findContent = makeDefaultFindContent({
    embedder,
    store: embeddedContentStore,
  });
  test("Should return content for relevant text", async () => {
    const query = "MongoDB Atlas";
    const { content } = await findContent({
      query,
    });
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });
  test("Should not return content for irrelevant text", async () => {
    const query =
      "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikolaf;ldkgsdjfnh;ks'l;addfsghjklafjklsgfjgreaj;agre;jlg;ljewrqjknerqnkjkgn;jwr;lwreg";
    const { content } = await findContent({
      query,
    });
    expect(content).toBeDefined();
    expect(content.length).toBe(0);
  });
});
