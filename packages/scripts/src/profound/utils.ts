import { MongoWriteError } from "../mercury/errors";

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

// MongoDB is based in NYC so we use Eastern time for all dates
export const defaultTimeZone = "America/New_York";

export function formatDate(date: Date, timeZone = defaultTimeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getNDaysAgoIsoDate(n: number, timeZone: string = "UTC") {
  const now = new Date();

  // Get the current date in the specified timezone
  const currentDateInTimezone = formatDate(now, timeZone);

  // Parse the date components
  const [year, month, day] = currentDateInTimezone.split("-").map(Number);

  // Create a UTC date object for that date and subtract n days
  // Using UTC to avoid timezone issues during date arithmetic
  const currentDateUTC = new Date(Date.UTC(year, month - 1, day));
  const targetDateUTC = new Date(
    currentDateUTC.getTime() - n * 24 * 60 * 60 * 1000
  );

  // Extract the date components and format as ISO date string
  const targetYear = targetDateUTC.getUTCFullYear();
  const targetMonth = (targetDateUTC.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0");
  const targetDay = targetDateUTC.getUTCDate().toString().padStart(2, "0");

  return `${targetYear}-${targetMonth}-${targetDay}`;
}

export function getNHoursAgoIsoDate(n: number, timeZone: string = "UTC") {
  const now = new Date();
  const targetDateUTC = new Date(now.getTime() - n * 60 * 60 * 1000);
  return targetDateUTC.toISOString();
}

export function getNHoursFromIsoDate(isoDate: string | Date, n: number) {
  const date = new Date(isoDate);
  const targetDateUTC = new Date(date.getTime() - n * 60 * 60 * 1000);
  return targetDateUTC.toISOString();
}

export function getSevenDaysAgoIsoDate(timeZone = defaultTimeZone) {
  return getNDaysAgoIsoDate(7, timeZone);
}

export function getYesterdayIsoDate(timeZone = defaultTimeZone) {
  return getNDaysAgoIsoDate(1, timeZone);
}

export function getTodayIsoDate(timeZone = defaultTimeZone) {
  return getNDaysAgoIsoDate(0, timeZone);
}

export function getTomorrowIsoDate(timeZone = defaultTimeZone) {
  return getNDaysAgoIsoDate(-1, timeZone);
}

// Corresponds with a unique index on the answers collection
export function makeDedupeKey(args: {
  reportDate: string;
  profoundPromptId: string;
  platformId: string;
}) {
  return `${args.reportDate} :: ${args.profoundPromptId} :: ${args.platformId}`;
}

export function countNumFailed(errors: Error[]) {
  return errors.reduce((acc, error) => {
    if (error instanceof MongoWriteError) {
      return acc + ((error.metadata.numDocs as number) ?? 1);
    } else {
      return acc + 1;
    }
  }, 0);
}
