const DAY = 86_400_000;

/** "Today", "Yesterday", "3 days ago", otherwise a short date. */
export function relativeDay(date: Date | string): string {
  const d = new Date(date);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(new Date()) - startOf(d)) / DAY);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return shortDate(d);
}

/** relativeDay phrased for mid-sentence use: "today", "3 days ago", "on 4 Nov 2026". */
export function relativeDayInline(date: Date | string): string {
  const label = relativeDay(date);
  return /^\d/.test(label) && !label.endsWith("ago") ? `on ${label}` : label.toLowerCase();
}

export function shortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function plural(count: number, one: string, many = one + "s"): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;
}

/** Template backgrounds saved before data-URL storage used temporary blob: URLs that no longer resolve. */
export function isDisplayableImage(src?: string | null): src is string {
  return !!src && (src.startsWith("data:image/") || src.startsWith("http") || (src.startsWith("/") && src !== "/placeholder.png"));
}
