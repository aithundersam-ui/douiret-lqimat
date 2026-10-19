/** Local date as YYYY-MM-DD (not UTC, so late-evening entries land on the right day). */
export function isoDay(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number);
  return isoDay(new Date(y, m - 1, d + n));
}

export function startOfMonth(day: string) {
  return `${day.slice(0, 8)}01`;
}

/** Every day from `from` to `to`, inclusive. */
export function daysBetween(from: string, to: string) {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}
