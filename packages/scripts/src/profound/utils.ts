export function validateDatestring(dateString: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error(
      `Invalid date format. Please use YYYY-MM-DD. Recieved: ${dateString}`
    );
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date. Recieved: ${dateString}`);
  }
  return dateString;
}

export function formatDate(date: Date, tz = "America/New_York"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getSevenDaysAgoIsoDate() {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();
  const todayUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate));
  const sevenDaysAgoUTC = new Date(
    todayUTC.getTime() - 7 * 24 * 60 * 60 * 1000
  );
  return sevenDaysAgoUTC.toISOString().slice(0, 10);
}

export function getYesterdayIsoDate() {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();
  const todayUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate));
  const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);
  return yesterdayUTC.toISOString().slice(0, 10);
}

export function getTodayIsoDate() {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();
  return new Date(Date.UTC(utcYear, utcMonth, utcDate))
    .toISOString()
    .slice(0, 10);
}

export function getTomorrowIsoDate() {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();
  return new Date(Date.UTC(utcYear, utcMonth, utcDate + 1))
    .toISOString()
    .slice(0, 10);
}
