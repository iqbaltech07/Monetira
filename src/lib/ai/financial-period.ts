/**
 * Financial Period Utilities
 *
 * Semua date range calculation dilakukan di sini, bukan oleh AI.
 * AI hanya mengenali intent ("bulan ini", "minggu ini") — application
 * menentukan tanggal start/end yang aktual dan konsisten.
 *
 * Timezone: local timezone aplikasi (tidak ada server-TZ conversion).
 */

export type PeriodKey =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "all_time";

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Returns the start (00:00:00.000) and end (23:59:59.999) of a given day.
 */
function dayRange(date: Date): DateRange {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end, label: formatDateLabel(date) };
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Returns a DateRange for a given PeriodKey based on the current local time.
 */
export function getPeriodRange(period: PeriodKey): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today": {
      return dayRange(today);
    }

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return dayRange(yesterday);
    }

    case "this_week": {
      // Week starts Monday (id-ID convention)
      const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0, Sun=6
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return {
        start: weekStart,
        end: weekEnd,
        label: `Minggu ini (${formatDateLabel(weekStart)} – ${formatDateLabel(weekEnd)})`,
      };
    }

    case "last_week": {
      const dayOfWeek = (today.getDay() + 6) % 7;
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - dayOfWeek);
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
      lastWeekEnd.setHours(23, 59, 59, 999);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
      lastWeekStart.setHours(0, 0, 0, 0);
      return {
        start: lastWeekStart,
        end: lastWeekEnd,
        label: `Minggu lalu (${formatDateLabel(lastWeekStart)} – ${formatDateLabel(lastWeekEnd)})`,
      };
    }

    case "this_month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return {
        start: monthStart,
        end: monthEnd,
        label: now.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        }),
      };
    }

    case "last_month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      return {
        start: lastMonth,
        end: lastMonthEnd,
        label: lastMonth.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        }),
      };
    }

    case "this_year": {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return {
        start: yearStart,
        end: yearEnd,
        label: `Tahun ${now.getFullYear()}`,
      };
    }

    case "all_time": {
      return {
        start: new Date(0),
        end: new Date(now.getFullYear() + 10, 11, 31),
        label: "Semua waktu",
      };
    }
  }
}

/**
 * Detects period intent from a natural language string.
 * Returns the best matching PeriodKey.
 * Defaults to "this_month" if no recognizable period is found.
 */
export function detectPeriod(text: string): PeriodKey {
  const lower = text.toLowerCase();

  if (
    lower.includes("hari ini") ||
    lower.includes("sekarang") ||
    lower.includes("today")
  )
    return "today";
  if (lower.includes("kemarin") || lower.includes("yesterday"))
    return "yesterday";
  if (lower.includes("minggu ini") || lower.includes("this week"))
    return "this_week";
  if (lower.includes("minggu lalu") || lower.includes("last week"))
    return "last_week";
  if (lower.includes("bulan lalu") || lower.includes("last month"))
    return "last_month";
  if (lower.includes("tahun ini") || lower.includes("this year"))
    return "this_year";
  if (lower.includes("semua") || lower.includes("all time")) return "all_time";

  // Default: bulan ini
  return "this_month";
}
