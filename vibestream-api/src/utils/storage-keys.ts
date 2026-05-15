/** Strip legacy local path prefixes (audio/, covers/) from DB values. */
export function normalizeAudioKey(stored: string): string {
  return stored.replace(/^audio[/\\]/, "");
}

export function normalizeCoverKey(stored: string): string {
  return stored.replace(/^covers[/\\]/, "");
}
