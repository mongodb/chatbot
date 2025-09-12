import { getCurrentSkills, TopicsToSkills } from "./getCurrentSkills";

const SKILL_REFRESH_DELAY = 86400000; // millisec in one day
const INITIAL_BACKOFF_DELAY = 60000; // 1 minute
const MAX_BACKOFF_DELAY = 3600000; // 1 hour
const BACKOFF_MULTIPLIER = 2;

export interface SkillRefreshManager {
  getTopicsToSkillsMap: () => TopicsToSkills | undefined;
  cleanup: () => void;
}

export function createSkillRefreshManager(): SkillRefreshManager {
  let topicToSkillMap: TopicsToSkills | undefined = undefined;
  let refreshTimer: NodeJS.Timeout | null = null;
  let retryTimer: NodeJS.Timeout | null = null;
  let consecutiveFailures = 0;
  let currentBackoffDelay = INITIAL_BACKOFF_DELAY;
  let isRefreshing = false;

  async function performRefresh() {
    if (isRefreshing) return;
    isRefreshing = true;

    try {
      topicToSkillMap = await getCurrentSkills();
      consecutiveFailures = 0;
      currentBackoffDelay = INITIAL_BACKOFF_DELAY;

      // Success! Schedule next periodic refresh
      console.log("Successfully refreshed TopicToSkillMap.");
      scheduleRefresh(SKILL_REFRESH_DELAY);
    } catch (error) {
      console.error(
        `TopicToSkillMap refresh failed (attempt ${consecutiveFailures + 1}):`,
        error
      );
      consecutiveFailures++;
      currentBackoffDelay = Math.min(
        currentBackoffDelay * BACKOFF_MULTIPLIER,
        MAX_BACKOFF_DELAY
      );
      console.log(
        `Next retry attempt in ${currentBackoffDelay / 1000} seconds`
      );

      // Failed! Schedule a retry with exponential backoff
      scheduleRetry();
    } finally {
      isRefreshing = false;
    }
  }

  function scheduleRefresh(delay: number) {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      performRefresh();
    }, delay);
  }

  function scheduleRetry() {
    if (retryTimer) {
      clearTimeout(retryTimer);
    }

    retryTimer = setTimeout(() => {
      retryTimer = null;
      performRefresh();
    }, currentBackoffDelay);
  }

  function cleanup() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  // Initial refresh
  performRefresh();

  return {
    getTopicsToSkillsMap: () => topicToSkillMap,
    cleanup,
  };
}
