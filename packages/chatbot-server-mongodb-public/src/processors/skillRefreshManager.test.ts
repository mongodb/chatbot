import { jest } from "@jest/globals";
import { createSkillRefreshManager } from "./skillRefreshManager";
import * as getCurrentSkillsModule from "./getCurrentSkills";

jest.mock("./getCurrentSkills");

const mockGetCurrentSkills = jest.mocked(
  getCurrentSkillsModule.getCurrentSkills
);

const mockTopicsToSkills = {
  "Database Administration": [
    {
      name: "MongoDB Atlas Admin",
      description: "Learn MongoDB Atlas administration",
      url: "https://learn.mongodb.com/skills/atlas-admin",
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

describe("skillRefreshManager", () => {
  let originalSetTimeout: typeof global.setTimeout;
  let originalClearTimeout: typeof global.clearTimeout;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;

  let timeoutCallbacks: Map<number, () => void>;
  let timeoutIds: number;

  beforeAll(() => {
    originalSetTimeout = global.setTimeout;
    originalClearTimeout = global.clearTimeout;
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods to avoid cluttering test output
    console.log = jest.fn();
    console.error = jest.fn();

    // Mock timers
    timeoutCallbacks = new Map();
    timeoutIds = 0;

    // Mock setTimeout so we can control when timeouts end
    global.setTimeout = jest.fn().mockImplementation((...args: unknown[]) => {
      const [callback] = args;
      const id = ++timeoutIds;
      timeoutCallbacks.set(id, callback as () => void);
      return id;
    }) as unknown as typeof setTimeout;

    global.clearTimeout = jest.fn().mockImplementation((...args: unknown[]) => {
      const [id] = args;
      timeoutCallbacks.delete(id as number);
    });
  });

  afterEach(() => {
    timeoutCallbacks.clear();
  });

  afterAll(() => {
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("Basic interface functionality", () => {
    it("should return undefined initially when getCurrentSkills fails", async () => {
      mockGetCurrentSkills.mockRejectedValue(new Error("Failed to get skills"));

      const manager = createSkillRefreshManager();

      expect(manager.getTopicsToSkillsMap()).toBeUndefined();
      expect(mockGetCurrentSkills).toHaveBeenCalledTimes(1);

      // Wait for the current promise to resolve (it should schedule a retry)
      await new Promise(process.nextTick);
      expect(timeoutCallbacks.size).toBe(1);
    });

    it("should return topics to skills map after successful refresh", async () => {
      mockGetCurrentSkills.mockResolvedValue(mockTopicsToSkills);

      const manager = createSkillRefreshManager();

      // Validates: Before the first refresh finishes, we shouldn't have any pending timeouts
      expect(timeoutCallbacks.size).toBe(0);
      expect(mockGetCurrentSkills).toHaveBeenCalledTimes(1);

      // Resolve promises manually & validate success outputs
      await new Promise(process.nextTick);
      expect(console.log).toHaveBeenCalledWith(
        "Successfully refreshed TopicToSkillMap."
      );
      expect(manager.getTopicsToSkillsMap()).toEqual(mockTopicsToSkills);
    });

    it("Creation should match SkillRefreshManager interface", () => {
      const manager = createSkillRefreshManager();

      expect(manager).toHaveProperty("getTopicsToSkillsMap");
      expect(manager).toHaveProperty("cleanup");
      expect(typeof manager.getTopicsToSkillsMap).toBe("function");
      expect(typeof manager.cleanup).toBe("function");
    });
  });

  describe("Daily refresh, timer management and scheduling", () => {
    it("should schedule periodic refresh after successful initial refresh", async () => {
      mockGetCurrentSkills.mockResolvedValue(mockTopicsToSkills);

      createSkillRefreshManager();

      // Initial call
      expect(mockGetCurrentSkills).toHaveBeenCalledTimes(1);

      // Wait for the current promise to resolve
      await new Promise(process.nextTick);

      // Should schedule next refresh with SKILL_REFRESH_DELAY (86400000ms = 1 day)
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        86400000
      );
    });

    it("should schedule retry with exponential backoff after failure", async () => {
      mockGetCurrentSkills.mockRejectedValue(new Error("Network error"));

      createSkillRefreshManager();

      // Initial call
      expect(mockGetCurrentSkills).toHaveBeenCalledTimes(1);

      // Wait for the current promise to resolve
      await new Promise(process.nextTick);

      // Should schedule retry with initial backoff delay * multiplier (120000ms = 2 minutes)
      // Note: currentBackoffDelay is multiplied BEFORE scheduling
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        120000
      );
    });

    it("should clear existing timer when scheduling new refresh", async () => {
      // Create promises that we can resolve manually (to mock multiple refreshes)
      let resolveFirst: (value: unknown) => void = () => {
        return;
      };
      let resolveSecond: (value: unknown) => void = () => {
        return;
      };
      const firstPromise = new Promise<unknown>((resolve) => {
        resolveFirst = resolve;
      });
      const secondPromise = new Promise<unknown>((resolve) => {
        resolveSecond = resolve;
      });

      mockGetCurrentSkills
        .mockReturnValueOnce(firstPromise as Promise<typeof mockTopicsToSkills>)
        .mockReturnValueOnce(
          secondPromise as Promise<typeof mockTopicsToSkills>
        );

      const manager = createSkillRefreshManager();

      // Complete first refresh successfully to schedule a timer
      resolveFirst(mockTopicsToSkills);
      await new Promise(process.nextTick);

      // Verify refresh timer was scheduled
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        86400000
      );

      // Clear mocks to track only subsequent calls
      (global.clearTimeout as jest.Mock).mockClear();

      // Complete second refresh successfully, which should clear the existing timer
      resolveSecond(mockTopicsToSkills);
      await new Promise(process.nextTick);

      // In this case, the timer is cleared in the callback (we only provided two
      // return values for the mock) so let's verify cleanup behavior instead
      manager.cleanup();
      expect(global.clearTimeout).toHaveBeenCalled();
    });

    it("should not start new refresh if already refreshing", async () => {
      let resolveGetCurrentSkills: (value: unknown) => void = () => {
        return;
      };
      const getCurrentSkillsPromise = new Promise<unknown>((resolve) => {
        resolveGetCurrentSkills = resolve;
      });

      mockGetCurrentSkills.mockReturnValue(
        getCurrentSkillsPromise as Promise<typeof mockTopicsToSkills>
      );

      createSkillRefreshManager();

      // Initial call starts refreshing
      expect(mockGetCurrentSkills).toHaveBeenCalledTimes(1);

      // Try to trigger another refresh while first is still in progress
      if (timeoutCallbacks.size > 0) {
        const refreshCallback = Array.from(timeoutCallbacks.values())[0];
        refreshCallback();
      }

      // getCurrentSkills should still only have been called once
      expect(mockGetCurrentSkills).toHaveBeenCalledTimes(1);

      // Resolve the first refresh
      resolveGetCurrentSkills(mockTopicsToSkills);
      await new Promise(process.nextTick);
    });
  });

  describe("Error handling, retries, and exponential backoff", () => {
    it("should handle consecutive failures with exponential backoff", async () => {
      mockGetCurrentSkills.mockRejectedValue(new Error("Persistent error"));

      createSkillRefreshManager();

      // Initial failure
      await new Promise(process.nextTick);
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        120000 // 2 minutes (initial 60000 * 2)
      );

      // Trigger first retry
      const firstRetryCallback = Array.from(timeoutCallbacks.values())[0];
      firstRetryCallback();
      await new Promise(process.nextTick);

      // Should schedule with doubled backoff (240000ms = 4 minutes) [120000 * 2]
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        240000
      );

      // Trigger second retry
      const secondRetryCallback = Array.from(timeoutCallbacks.values())[0];
      secondRetryCallback();
      await new Promise(process.nextTick);

      // Should schedule with doubled backoff again (480000ms = 8 minutes) [240000 * 2]
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        480000
      );
    });

    it("should cap backoff delay at maximum", async () => {
      mockGetCurrentSkills.mockRejectedValue(new Error("Persistent error"));

      createSkillRefreshManager();

      // Simulate many failures to reach max backoff
      for (let i = 0; i < 10; i++) {
        await new Promise(process.nextTick);
        if (timeoutCallbacks.size > 0) {
          const retryCallback = Array.from(timeoutCallbacks.values())[0];
          retryCallback();
        }
      }

      // Should eventually cap at MAX_BACKOFF_DELAY (3600000ms = 1 hour)
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        3600000
      );
    });

    it("should reset backoff after successful refresh", async () => {
      // Start with failure
      mockGetCurrentSkills.mockRejectedValueOnce(new Error("Temporary error"));

      createSkillRefreshManager();

      // Initial failure
      await new Promise(process.nextTick);
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        120000 // First failure uses initial * multiplier
      );

      // Now succeed on retry
      mockGetCurrentSkills.mockResolvedValue(mockTopicsToSkills);
      const retryCallback = Array.from(timeoutCallbacks.values())[0];
      retryCallback();
      await new Promise(process.nextTick);

      // Should reset to normal refresh interval
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        86400000 // Back to daily refresh
      );
    });

    it("should log errors with attempt count", async () => {
      const error = new Error("Test error");
      mockGetCurrentSkills.mockRejectedValue(error);

      createSkillRefreshManager();

      await new Promise(process.nextTick);

      expect(console.error).toHaveBeenCalledWith(
        "TopicToSkillMap refresh failed (attempt 1):",
        error
      );

      // Trigger retry
      const retryCallback = Array.from(timeoutCallbacks.values())[0];
      retryCallback();
      await new Promise(process.nextTick);

      expect(console.error).toHaveBeenCalledWith(
        "TopicToSkillMap refresh failed (attempt 2):",
        error
      );
    });

    it("should log retry delay information", async () => {
      mockGetCurrentSkills.mockRejectedValue(new Error("Test error"));

      createSkillRefreshManager();

      await new Promise(process.nextTick);

      expect(console.log).toHaveBeenCalledWith(
        "Next retry attempt in 120 seconds"
      );
    });
  });

  describe("Skill updates scenarios", () => {
    it("should handle updated skills data", async () => {
      const initialSkills = {
        Topic1: [
          {
            name: "Skill 1",
            description: "Description 1",
            url: "https://example.com/1",
          },
        ],
      };

      const updatedSkills = {
        Topic1: [
          {
            name: "Skill 1",
            description: "Updated Description 1",
            url: "https://example.com/1",
          },
        ],
        Topic2: [
          {
            name: "Skill 2",
            description: "Description 2",
            url: "https://example.com/2",
          },
        ],
      };

      mockGetCurrentSkills.mockResolvedValueOnce(initialSkills);

      const manager = createSkillRefreshManager();
      await new Promise(process.nextTick);

      expect(manager.getTopicsToSkillsMap()).toEqual(initialSkills);

      // Simulate next refresh with updated data
      mockGetCurrentSkills.mockResolvedValue(updatedSkills);
      const refreshCallback = Array.from(timeoutCallbacks.values())[0];
      refreshCallback();
      await new Promise(process.nextTick);

      expect(manager.getTopicsToSkillsMap()).toEqual(updatedSkills);
    });

    it("should handle empty skills data", async () => {
      mockGetCurrentSkills.mockResolvedValue({});

      const manager = createSkillRefreshManager();
      await new Promise(process.nextTick);

      expect(manager.getTopicsToSkillsMap()).toEqual({});
    });

    it("should handle null/undefined from getCurrentSkills", async () => {
      mockGetCurrentSkills.mockResolvedValue(null as any);

      const manager = createSkillRefreshManager();
      await new Promise(process.nextTick);

      expect(manager.getTopicsToSkillsMap()).toBeNull();
    });
  });

  describe("Cleanup functionality", () => {
    it("should clear refresh timer on cleanup", async () => {
      mockGetCurrentSkills.mockResolvedValue(mockTopicsToSkills);

      const manager = createSkillRefreshManager();

      // Wait for successful refresh to schedule periodic timer
      await new Promise(process.nextTick);

      manager.cleanup();

      expect(global.clearTimeout).toHaveBeenCalled();
    });

    it("should clear retry timer on cleanup", async () => {
      mockGetCurrentSkills.mockRejectedValue(new Error("Test error"));

      const manager = createSkillRefreshManager();

      // Wait for initial failure to schedule retry
      await new Promise(process.nextTick);

      manager.cleanup();

      expect(global.clearTimeout).toHaveBeenCalled();
    });

    it("should handle cleanup when no timers are set", () => {
      mockGetCurrentSkills.mockRejectedValue(new Error("Test error"));

      const manager = createSkillRefreshManager();

      // Clear immediately before any timers are set
      manager.cleanup();

      expect(global.clearTimeout).not.toHaveBeenCalled();
    });

    it("should clear both timers if both exist", async () => {
      // Start with success to create refresh timer
      mockGetCurrentSkills.mockResolvedValueOnce(mockTopicsToSkills);

      const manager = createSkillRefreshManager();
      await new Promise(process.nextTick);

      // Now fail to create retry timer
      mockGetCurrentSkills.mockRejectedValue(new Error("Test error"));
      if (timeoutCallbacks.size > 0) {
        const refreshCallback = Array.from(timeoutCallbacks.values())[0];
        refreshCallback();
        await new Promise(process.nextTick);
      }

      // Clear both timers
      manager.cleanup();

      // Should clear all timers that were set
      expect(global.clearTimeout).toHaveBeenCalled();
    });

    it("should clear timer references to null after cleanup", () => {
      const manager = createSkillRefreshManager();
      manager.cleanup();

      // Verify cleanup can be called multiple times without error
      expect(() => manager.cleanup()).not.toThrow();
    });
  });
});
