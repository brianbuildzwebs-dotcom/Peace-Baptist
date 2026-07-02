import { format, parseISO } from "date-fns";

/** Parse YYYY-MM-DD without UTC timezone shift (US church dates). */
export function parseEventDate(dateStr) {
  if (!dateStr) return null;
  return parseISO(dateStr);
}

export function formatEventDate(dateStr, pattern) {
  const date = parseEventDate(dateStr);
  return date ? format(date, pattern) : "";
}