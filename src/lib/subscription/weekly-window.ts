/**
 * Weekly Usage Window Utility
 *
 * Provides deterministic calculation of weekly cycles (ISO standard week: Monday to Sunday).
 * Strictly timestamp-based. ZERO usage of setInterval or client timer tricks.
 */

export interface WeeklyWindow {
  weekId: string; // e.g. "2026-W39"
  weekStart: Date; // Monday 00:00:00.000 local/UTC
  weekEnd: Date; // Sunday 23:59:59.999 local/UTC
  daysRemaining: number;
}

/**
 * Returns ISO-8601 week number and year.
 */
export function getIsoWeekDetails(date: Date): { year: number; week: number } {
  const target = new Date(date.valueOf());
  // ISO week date days: Monday=1 ... Sunday=7
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber =
    1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return {
    year: new Date(firstThursday).getFullYear(),
    week: weekNumber,
  };
}

/**
 * Returns the weekly window containing the specified reference date.
 */
export function getWeeklyWindow(refDate: Date = new Date()): WeeklyWindow {
  const { year, week } = getIsoWeekDetails(refDate);
  const weekId = `${year}-W${String(week).padStart(2, "0")}`;

  // Find Monday 00:00:00.000
  const day = refDate.getDay();
  // day 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(refDate);
  weekStart.setDate(refDate.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  // Find Sunday 23:59:59.999
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const msRemaining = Math.max(0, weekEnd.getTime() - refDate.getTime());
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  return {
    weekId,
    weekStart,
    weekEnd,
    daysRemaining,
  };
}

/**
 * Checks whether two dates fall into the same ISO calendar week.
 */
export function isSameWeek(d1: Date, d2: Date): boolean {
  const w1 = getIsoWeekDetails(d1);
  const w2 = getIsoWeekDetails(d2);
  return w1.year === w2.year && w1.week === w2.week;
}
