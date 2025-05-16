export function makeBulletPrompt(bullets: string[]): string {
  return bullets.map((bullet, i) => `\n${i + 1}. ${bullet}`).join("\n");
}
