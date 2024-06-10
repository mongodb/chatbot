export function safeFileName(fileName: string) {
  return fileName.replace(/[/\\?%*:|"<>]/g, "-");
}
