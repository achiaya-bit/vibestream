export const formatPlays = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
};

export function parseDuration(value: string): number {
  const [m, s] = value.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}
