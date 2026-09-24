import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  isValid,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { id } from "date-fns/locale";

export type ReportPeriodType =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_YEAR"
  | "ALL_TIME"
  | "CUSTOM";

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface PeriodOption {
  type: ReportPeriodType;
  label: string;
}

export const REPORT_PERIOD_OPTIONS: PeriodOption[] = [
  { type: "THIS_MONTH", label: "Bulan Ini" },
  { type: "LAST_MONTH", label: "Bulan Lalu" },
  { type: "THIS_WEEK", label: "Minggu Ini" },
  { type: "TODAY", label: "Hari Ini" },
  { type: "THIS_YEAR", label: "Tahun Ini" },
  { type: "ALL_TIME", label: "Semua Waktu" },
  { type: "CUSTOM", label: "Kustom Tanggal" },
];

/**
 * Validates a custom date range.
 * - Start and end must be valid dates.
 * - Start must be less than or equal to End.
 */
export function validateCustomDateRange(
  start: Date | string,
  end: Date | string,
): { valid: boolean; error?: string } {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;

  if (!isValid(startDate)) {
    return { valid: false, error: "Tanggal mulai tidak valid." };
  }

  if (!isValid(endDate)) {
    return { valid: false, error: "Tanggal akhir tidak valid." };
  }

  if (isAfter(startDate, endDate)) {
    return {
      valid: false,
      error: "Tanggal mulai tidak boleh melebihi tanggal akhir.",
    };
  }

  return { valid: true };
}

/**
 * Formats a date range into a user-friendly Indonesian string label.
 */
export function formatDateRangeLabel(start: Date, end: Date): string {
  if (start.getTime() === 0) {
    return "Semua Transaksi";
  }

  const startFormatted = format(start, "d MMM yyyy", { locale: id });
  const endFormatted = format(end, "d MMM yyyy", { locale: id });

  if (startFormatted === endFormatted) {
    return startFormatted;
  }

  return `${startFormatted} – ${endFormatted}`;
}

/**
 * Calculates start and end Date for a given ReportPeriodType.
 * Consistently anchors to start of day (00:00:00.000) and end of day (23:59:59.999).
 */
export function getReportPeriodRange(
  period: ReportPeriodType,
  customStart?: Date | string,
  customEnd?: Date | string,
  referenceDate: Date = new Date(),
): DateRange {
  const ref = new Date(referenceDate);

  switch (period) {
    case "TODAY": {
      const start = startOfDay(ref);
      const end = endOfDay(ref);
      return {
        start,
        end,
        label: `Hari Ini (${format(ref, "d MMMM yyyy", { locale: id })})`,
      };
    }

    case "THIS_WEEK": {
      // Week starts on Monday for Indonesian standard
      const start = startOfWeek(ref, { weekStartsOn: 1 });
      const end = endOfWeek(ref, { weekStartsOn: 1 });
      return {
        start,
        end,
        label: `Minggu Ini (${formatDateRangeLabel(start, end)})`,
      };
    }

    case "THIS_MONTH": {
      const start = startOfMonth(ref);
      const end = endOfMonth(ref);
      return {
        start,
        end,
        label: format(ref, "MMMM yyyy", { locale: id }),
      };
    }

    case "LAST_MONTH": {
      const lastMonth = subMonths(ref, 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);
      return {
        start,
        end,
        label: format(lastMonth, "MMMM yyyy", { locale: id }),
      };
    }

    case "THIS_YEAR": {
      const start = startOfYear(ref);
      const end = endOfYear(ref);
      return {
        start,
        end,
        label: `Tahun ${format(ref, "yyyy")}`,
      };
    }

    case "ALL_TIME": {
      const start = new Date(0);
      const end = new Date(ref.getFullYear() + 10, 11, 31, 23, 59, 59, 999);
      return {
        start,
        end,
        label: "Semua Waktu",
      };
    }

    case "CUSTOM": {
      if (customStart && customEnd) {
        const validation = validateCustomDateRange(customStart, customEnd);
        if (validation.valid) {
          const s = startOfDay(
            typeof customStart === "string"
              ? new Date(customStart)
              : customStart,
          );
          const e = endOfDay(
            typeof customEnd === "string" ? new Date(customEnd) : customEnd,
          );
          return {
            start: s,
            end: e,
            label: `Kustom (${formatDateRangeLabel(s, e)})`,
          };
        }
      }
      // Fallback if custom dates are missing or invalid
      const start = startOfMonth(ref);
      const end = endOfMonth(ref);
      return {
        start,
        end,
        label: `Kustom (${format(ref, "MMMM yyyy", { locale: id })})`,
      };
    }
  }
}

/**
 * Returns the corresponding previous period for comparison.
 * - THIS_MONTH -> LAST_MONTH
 * - LAST_MONTH -> Month before last month
 * - THIS_WEEK -> Previous week
 * - TODAY -> Yesterday
 * - THIS_YEAR -> Last year
 * Returns null for ALL_TIME or custom ranges where comparison is ambiguous.
 */
export function getPreviousPeriodRange(
  period: ReportPeriodType,
  currentRange: DateRange,
): DateRange | null {
  switch (period) {
    case "TODAY": {
      const yesterday = new Date(currentRange.start);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
        label: `Kemarin (${format(yesterday, "d MMMM yyyy", { locale: id })})`,
      };
    }

    case "THIS_WEEK": {
      const prevWeekStart = subWeeks(currentRange.start, 1);
      const prevWeekEnd = subWeeks(currentRange.end, 1);
      return {
        start: startOfDay(prevWeekStart),
        end: endOfDay(prevWeekEnd),
        label: `Minggu Lalu (${formatDateRangeLabel(prevWeekStart, prevWeekEnd)})`,
      };
    }

    case "THIS_MONTH": {
      const lastMonth = subMonths(currentRange.start, 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);
      return {
        start,
        end,
        label: format(lastMonth, "MMMM yyyy", { locale: id }),
      };
    }

    case "LAST_MONTH": {
      const twoMonthsAgo = subMonths(currentRange.start, 1);
      const start = startOfMonth(twoMonthsAgo);
      const end = endOfMonth(twoMonthsAgo);
      return {
        start,
        end,
        label: format(twoMonthsAgo, "MMMM yyyy", { locale: id }),
      };
    }

    case "THIS_YEAR": {
      const lastYear = subYears(currentRange.start, 1);
      const start = startOfYear(lastYear);
      const end = endOfYear(lastYear);
      return {
        start,
        end,
        label: `Tahun ${format(lastYear, "yyyy")}`,
      };
    }

    case "ALL_TIME":
    case "CUSTOM":
      return null;
  }
}
