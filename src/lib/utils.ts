const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function dayMonth(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return { day: String(d || 1).padStart(2, "0"), month: MONTHS[(m || 1) - 1] ?? "" };
}

export function longDate(iso: string) {
  const { day, month } = dayMonth(iso);
  return `${day} ${month[0]}${month.slice(1).toLowerCase()} ${iso.slice(0, 4)}`;
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "startup"
  );
}

export function makeUid(prefix = "x") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
