/**  URLs that we are forbidden from exporting for training */
export const forbiddenUrls = new Set([
  "https://mongodb.com/docs/manual/reference/mongodb-wire-protocol/",
  "https://mongodb.com/docs/manual/core/read-preference-mechanics/",
  "https://mongodb.com/docs/manual/reference/replica-set-protocol-versions/",
  "https://mongodb.com/docs/manual/core/wiredtiger/",
  "https://mongodb.com/docs/manual/core/journaling/",
  "https://mongodb.com/docs/manual/core/security-encryption-at-rest/",
  "https://mongodb.com/docs/manual/reference/server-sessions/",
  "https://mongodb.com/docs/manual/core/index-creation/",
  "https://mongodb.com/docs/manual/core/distributed-queries/",
  "https://mongodb.com/docs/manual/core/read-isolation-consistency-recency/",
  "https://mongodb.com/docs/manual/core/query-plans/",
  "https://mongodb.com/docs/manual/core/timeseries/timeseries-compression/",
  "https://mongodb.com/docs/manual/core/replica-set-elections/",
  "https://mongodb.com/docs/manual/core/replica-set-rollbacks/",
]);

/**
  The {@link PersistedPage.sourceName} for public datasets should contain `snooty` (Docs) or `devcenter` (Developer Center).
 */
export const publicDatasetSourceName = /snooty|devcenter/;
