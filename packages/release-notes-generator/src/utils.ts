/**
 Given an arbitrary string, replace invalid characters with a dash to make it a valid filename.
 */
export function safeFileName(fileName: string): string {
  return fileName.replace(/[/\\?%*:|"<>]/g, "-");
}

/**
 Returns a timestamp in the format YYYY-MM-DD-HH-MM-SS
 */
export function currentTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
