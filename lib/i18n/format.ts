export type DateFormatOptions = Intl.DateTimeFormatOptions;

function validDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validTimezone(timezone: string): string {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
    return timezone;
  } catch {
    return "UTC";
  }
}

export function formatMarketDate(
  value: string | Date,
  locale: string,
  timezone: string,
  options: DateFormatOptions = { dateStyle: "medium" },
): string {
  const date = validDate(value);
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: validTimezone(timezone) }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(date);
  }
}

export function formatMarketDateTime(
  value: string | Date,
  locale: string,
  timezone: string,
): string {
  return formatMarketDate(value, locale, timezone, { dateStyle: "medium", timeStyle: "short" });
}
