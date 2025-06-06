import { prismaSourceConstructor } from "./prisma";
jest.setTimeout(50000);

describe("prismaSourceConstructor", () => {
  it("should load files", async () => {
    const prismaSource = await prismaSourceConstructor();

    const pages = await prismaSource.fetchPages();

    expect(pages.length).toBeGreaterThan(0);
  });
});
