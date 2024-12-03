export function createRunId(namespace?: string) {
  const now = new Date();
  const [date, time] = now.toISOString().split("T");
  // Format a string for the current day in YYYYMMDD format
  const datestamp = date.replace(/-/g, "");
  // Format a string for the current time in 24H HHMM format
  const minutestamp = time.replace(/:/g, "").slice(0, 4);
  const millistamp = now
    .getTime()
    .toString(36)
    .slice(2, 2 + 5);
  const timestamp = `${datestamp}-${minutestamp}-${millistamp}`;
  return namespace ? `${namespace}-${timestamp}` : timestamp;
}
