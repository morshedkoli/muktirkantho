/**
 * Bangla date/time formatters.
 *
 * These accept `Date | string | number` rather than just `Date` on purpose:
 * values that round-trip through `unstable_cache` (or any JSON boundary) come
 * back as ISO strings, and `Intl.DateTimeFormat.format` throws `RangeError:
 * Invalid time value` on those — which takes down the whole page render. An
 * unformattable date is never worth a 500, so we render nothing instead.
 */
export type DateLike = Date | string | number | null | undefined;

function toValidDate(value: DateLike): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function format(value: DateLike, options: Intl.DateTimeFormatOptions): string {
  const date = toValidDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("bn-BD", options).format(date);
}

export function formatBanglaDate(date: DateLike): string {
  return format(date, { day: "numeric", month: "long", year: "numeric" });
}

export function formatBanglaShortDate(date: DateLike): string {
  return format(date, { day: "numeric", month: "short" });
}

export function formatBanglaDateTime(date: DateLike): string {
  return format(date, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function formatBanglaTime(date: DateLike): string {
  return format(date, { hour: "numeric", minute: "2-digit" });
}
