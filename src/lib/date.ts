export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/** "Mon, Apr 28" — used in session rows and grid cells */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "Apr 28, 2026" — used in date columns (no weekday) */
export function formatDateMedium(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "Monday, April 28, 2026" — used in page headers */
export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
