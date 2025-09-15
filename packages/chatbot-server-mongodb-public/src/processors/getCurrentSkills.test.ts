import { jest } from "@jest/globals";
import puppeteer from "puppeteer";
import { getCurrentSkills, type TopicsToSkills } from "./getCurrentSkills";

jest.mock("puppeteer");

const mockPuppeteer = jest.mocked(puppeteer);

describe("getCurrentSkills", () => {
  let mockBrowser: any;
  let mockPage: any;
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    mockPage = {
      goto: jest.fn(),
      evaluate: jest.fn(),
    };

    mockBrowser = {
      newPage: jest.fn().mockReturnValue(Promise.resolve(mockPage)),
      close: jest.fn(),
    };

    mockPuppeteer.launch.mockResolvedValue(mockBrowser);
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe("successful scraping", () => {
    const mockPageData = {
      pageContext: {
        pageProps: {
          storefrontData: {
            topics: [
              {
                title: "Database Administration",
                skills: [
                  {
                    title: "MongoDB Atlas Admin",
                    description: "Learn MongoDB Atlas administration",
                    url: "https://learn.mongodb.com/skills/atlas-admin",
                  },
                  {
                    title: "Database Backup",
                    description: "Master database backup strategies",
                    url: "https://learn.mongodb.com/skills/backup",
                  },
                ],
              },
              {
                title: "Application Development",
                skills: [
                  {
                    title: "Node.js Developer Path",
                    description: "Build apps with Node.js and MongoDB",
                    url: "https://learn.mongodb.com/skills/nodejs-dev",
                  },
                ],
              },
            ],
          },
        },
      },
    };

    const expectedOutput: TopicsToSkills = {
      "Database Administration": [
        {
          name: "MongoDB Atlas Admin",
          description: "Learn MongoDB Atlas administration",
          url: "https://learn.mongodb.com/skills/atlas-admin",
        },
        {
          name: "Database Backup",
          description: "Master database backup strategies",
          url: "https://learn.mongodb.com/skills/backup",
        },
      ],
      "Application Development": [
        {
          name: "Node.js Developer Path",
          description: "Build apps with Node.js and MongoDB",
          url: "https://learn.mongodb.com/skills/nodejs-dev",
        },
      ],
    };

    it("should successfully scrape and parse skills data", async () => {
      mockPage.evaluate.mockResolvedValue(mockPageData);

      const result = await getCurrentSkills();

      expect(mockPuppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalledWith(
        "https://learn.mongodb.com/skills",
        {
          waitUntil: "networkidle0",
          timeout: 30000,
        }
      );
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        "vite-plugin-ssr_pageContext"
      );
      expect(result).toEqual(expectedOutput);
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should handle skills with missing descriptions", async () => {
      const dataWithMissingDescription = {
        pageContext: {
          pageProps: {
            storefrontData: {
              topics: [
                {
                  title: "Test Topic",
                  skills: [
                    {
                      title: "Skill with description",
                      description: "This skill has a description",
                      url: "https://example.com/1",
                    },
                    {
                      title: "Skill without description",
                      url: "https://example.com/2",
                    },
                  ],
                },
              ],
            },
          },
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithMissingDescription);

      const result = await getCurrentSkills();

      expect(result).toEqual({
        "Test Topic": [
          {
            name: "Skill with description",
            description: "This skill has a description",
            url: "https://example.com/1",
          },
          {
            name: "Skill without description",
            description: undefined,
            url: "https://example.com/2",
          },
        ],
      });
    });

    it("should filter out malformed skills", async () => {
      const dataWithMalformedSkills = {
        pageContext: {
          pageProps: {
            storefrontData: {
              topics: [
                {
                  title: "Test Topic",
                  skills: [
                    // Notice - some are missing fields
                    {
                      title: "Valid skill",
                      description: "Valid description",
                      url: "https://example.com/valid",
                    },
                    {
                      title: "Missing URL skill",
                      description: "Has description but no URL",
                    },
                    {
                      url: "https://example.com/missing-title",
                      description: "Has URL but no title",
                    },
                    {
                      title: "",
                      url: "https://example.com/empty-title",
                    },
                  ],
                },
              ],
            },
          },
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithMalformedSkills);

      const result = await getCurrentSkills();

      expect(result).toEqual({
        "Test Topic": [
          {
            name: "Valid skill",
            description: "Valid description",
            url: "https://example.com/valid",
          },
        ],
      });
    });

    it("should filter out topics with no valid skills", async () => {
      const dataWithEmptyTopics = {
        pageContext: {
          pageProps: {
            storefrontData: {
              topics: [
                {
                  title: "Topic with valid skills",
                  skills: [
                    {
                      title: "Valid skill",
                      url: "https://example.com/valid",
                    },
                  ],
                },
                {
                  title: "Topic with no valid skills",
                  skills: [
                    {
                      title: "",
                      url: "https://example.com/invalid",
                    },
                    {
                      title: "Missing URL",
                      description: "No URL provided",
                    },
                  ],
                },
                {
                  title: "Topic with empty skills array",
                  skills: [],
                },
              ],
            },
          },
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithEmptyTopics);

      const result = await getCurrentSkills();

      expect(result).toEqual({
        "Topic with valid skills": [
          {
            name: "Valid skill",
            description: undefined,
            url: "https://example.com/valid",
          },
        ],
      });
    });
  });

  describe("Web scraping error handling", () => {
    it("should handle puppeteer launch failure", async () => {
      const launchError = new Error("Failed to launch browser");
      mockPuppeteer.launch.mockRejectedValue(launchError);

      await expect(getCurrentSkills()).rejects.toThrow(
        "Failed to launch browser"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error scraping skills data:",
        launchError
      );
    });

    it("should handle page navigation failure", async () => {
      const navigationError = new Error("Navigation timeout");
      mockPage.goto.mockRejectedValue(navigationError);

      await expect(getCurrentSkills()).rejects.toThrow("Navigation timeout");
      expect(console.error).toHaveBeenCalledWith(
        "Error scraping skills data:",
        navigationError
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should handle missing HTML element", async () => {
      mockPage.evaluate.mockRejectedValue(
        new Error('Element with ID "vite-plugin-ssr_pageContext" not found')
      );

      await expect(getCurrentSkills()).rejects.toThrow(
        'Element with ID "vite-plugin-ssr_pageContext" not found'
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error scraping skills data:",
        expect.any(Error)
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should close browser even if an error occurs", async () => {
      const error = new Error("Test error");
      mockPage.goto.mockRejectedValue(error);

      await expect(getCurrentSkills()).rejects.toThrow("Test error");
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should handle browser close failure", async () => {
      const closeError = new Error("Failed to close browser");
      mockBrowser.close.mockRejectedValue(closeError);
      mockPage.evaluate.mockResolvedValue({
        pageContext: { pageProps: { storefrontData: { topics: [] } } },
      });

      // Should throw because browser close failure happens in finally block
      await expect(getCurrentSkills()).rejects.toThrow(
        "Failed to close browser"
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });

  describe("Malformed/unexpected JSON error cases", () => {
    it("should handle invalid JSON in page element", async () => {
      mockPage.evaluate.mockRejectedValue(
        new Error("Failed to parse JSON from page context element: SyntaxError")
      );

      await expect(getCurrentSkills()).rejects.toThrow(
        "Failed to parse JSON from page context element: SyntaxError"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error scraping skills data:",
        expect.any(Error)
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should handle missing topics data", async () => {
      const dataWithMissingTopics = {
        pageContext: {
          pageProps: {
            storefrontData: {},
          },
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithMissingTopics);

      await expect(getCurrentSkills()).rejects.toThrow(
        "Topics data not found at expected path: pageContext.pageProps.storefrontData.topics"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error scraping skills data:",
        expect.any(Error)
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should handle non-array topics data", async () => {
      const dataWithInvalidTopics = {
        pageContext: {
          pageProps: {
            storefrontData: {
              topics: "not an array",
            },
          },
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithInvalidTopics);

      await expect(getCurrentSkills()).rejects.toThrow(
        "Topics data not found at expected path: pageContext.pageProps.storefrontData.topics"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error scraping skills data:",
        expect.any(Error)
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should handle malformed topics", async () => {
      const dataWithMalformedTopics = {
        pageContext: {
          pageProps: {
            storefrontData: {
              topics: [
                {
                  title: "Valid Topic",
                  skills: [
                    {
                      title: "Valid skill",
                      url: "https://example.com/valid",
                    },
                  ],
                },
                {
                  // Missing title
                  skills: [
                    {
                      title: "Should be ignored",
                      url: "https://example.com/ignored",
                    },
                  ],
                },
                {
                  title: "Topic with missing skills",
                  // Missing skills array
                },
              ],
            },
          },
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithMalformedTopics);

      const result = await getCurrentSkills();

      expect(result).toEqual({
        "Valid Topic": [
          {
            name: "Valid skill",
            description: undefined,
            url: "https://example.com/valid",
          },
        ],
      });
    });

    it("should handle empty topics array", async () => {
      const dataWithEmptyTopics = {
        pageContext: {
          pageProps: {
            storefrontData: {
              topics: [],
            },
          },
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithEmptyTopics);

      const result = await getCurrentSkills();

      expect(result).toEqual({});
    });

    it("should handle deeply nested missing data", async () => {
      const dataWithMissingNesting = {
        pageContext: {
          pageProps: {},
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithMissingNesting);

      await expect(getCurrentSkills()).rejects.toThrow(
        "Topics data not found at expected path: pageContext.pageProps.storefrontData.topics"
      );
    });

    it("should handle null/undefined values in nested path", async () => {
      const dataWithNullValues = {
        pageContext: {
          pageProps: {
            storefrontData: null,
          },
        },
      };

      mockPage.evaluate.mockResolvedValue(dataWithNullValues);

      await expect(getCurrentSkills()).rejects.toThrow(
        "Topics data not found at expected path: pageContext.pageProps.storefrontData.topics"
      );
    });
  });
});
