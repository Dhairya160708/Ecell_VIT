import type { EventItem } from "@/types/content";

export type EventStatus = "Ongoing" | "Upcoming" | "Past";

/** Today as yyyy-mm-dd in campus time (IST), so "today" doesn't flip at 5:30am for a Mumbai audience. */
export function todayIST(now = new Date()) {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

/** Status is always derived from the stored dates, never stored itself, so it can't go stale. */
export function eventStatus(e: Pick<EventItem, "date" | "endDate">, today = todayIST()): EventStatus {
  const end = e.endDate && e.endDate >= e.date ? e.endDate : e.date;
  if (today < e.date) return "Upcoming";
  if (today > end) return "Past";
  return "Ongoing";
}

const rank = { Ongoing: 0, Upcoming: 1, Past: 2 } as const;

/** Happening now first, then what's coming (soonest first), then past events (most recent first). */
/** `today` is null before the browser has told us the date (during prerender): fall back to newest date first. */
export function sortEvents(events: EventItem[], today: string | null) {
  if (!today) return [...events].sort((a, b) => b.date.localeCompare(a.date));
  return [...events].sort((a, b) => {
    const sa = eventStatus(a, today),
      sb = eventStatus(b, today);
    if (sa !== sb) return rank[sa] - rank[sb];
    return sa === "Past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
  });
}

/**
 * Where an event card leads. There are no event detail pages yet, so everything goes to the homepage.
 * When detail pages exist, change this one function (e.g. `/events/${e.slug}`) and every card follows.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function eventHref(e: EventItem) {
  return "/";
}
