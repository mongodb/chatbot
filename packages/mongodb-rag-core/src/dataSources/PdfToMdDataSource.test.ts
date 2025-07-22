import {
  makePdfToMarkdownDataSource,
  MakePdfToMarkdownDataSourceArgs,
} from "./PdfToMdDataSource";
import pdf2md from "@opendocsg/pdf2md";

jest.mock("@opendocsg/pdf2md");

const mockPdf2Md = pdf2md as jest.Mock;

describe("PdfToMdDataSource", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseParams: Partial<MakePdfToMarkdownDataSourceArgs> = {
    name: "test-source",
    sourceType: "pdf",
    metadata: {
      foo: "bar",
    },
  };

  it("should get markdown content as Page from urls", async () => {
    mockPdf2Md.mockResolvedValue("# My PDF Title\n\nContent");
    const params = {
      ...baseParams,
      urls: ["https://mongodb.com/some-page.pdf"],
      getPdfBuffer: (_url) => Buffer.from("string"),
      getTitleFromContent: () => "My Custom Title",
      transformPageUrl: (url) => url.replace(".pdf", ""),
    } as MakePdfToMarkdownDataSourceArgs;

    const dataSource = makePdfToMarkdownDataSource(params);

    const pages = await dataSource.fetchPages();

    expect(pages.length).toBe(1);
    expect(pages[0].sourceName).toBe("test-source");
    expect(pages[0].title).toBe("My Custom Title");
    expect(pages[0].url).toBe("https://mongodb.com/some-page");
    expect(pages[0].sourceType).toBe("pdf");
    expect(pages[0].metadata?.foo).toBe("bar");
  });

  it("should exclude failed pdfs from result", async () => {
    const params = {
      ...baseParams,
      urls: [
        "https://mongodb.com/some-page.pdf",
        "https://mongodb.com/some-page-broken-pdf.pdf",
      ],
      // For the first call, return buffer. For the second call, raise error.
      getPdfBuffer: jest
        .fn()
        .mockReturnValueOnce(Buffer.from("string"))
        .mockImplementationOnce(() => {
          throw new Error("Mock Error");
        }),
    } as MakePdfToMarkdownDataSourceArgs;

    jest.spyOn(console, "warn"); //.mockImplementationOnce(() => "warned");

    const dataSource = makePdfToMarkdownDataSource(params);

    const pages = await dataSource.fetchPages();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(pages.length).toBe(1);
    expect(pages[0].sourceName).toBe("test-source");
    expect(pages[0].url).toBe("https://mongodb.com/some-page.pdf");
    expect(pages[0].sourceType).toBe("pdf");
    expect(pages[0].metadata?.foo).toBe("bar");
  });
});
