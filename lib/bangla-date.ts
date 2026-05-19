export function formatBanglaDate(date: Date): string {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatBanglaShortDate(date: Date): string {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatBanglaDateTime(date: Date): string {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatBanglaTime(date: Date): string {
  return new Intl.DateTimeFormat("bn-BD", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
