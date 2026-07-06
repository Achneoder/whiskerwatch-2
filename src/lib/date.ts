export function daysSince(dateIso: string): number {
  const then = new Date(dateIso).getTime();
  if (Number.isNaN(then)) return 0;
  const diff = Date.now() - then;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
