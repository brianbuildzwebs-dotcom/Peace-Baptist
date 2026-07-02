export function hour24To12(hour24) {
  const normalized = ((Number(hour24) % 24) + 24) % 24;
  const period = normalized >= 12 ? "PM" : "AM";
  const hour12 = normalized % 12 || 12;
  return { hour12, period };
}

export function hour12To24(hour12, period) {
  let hour = Number(hour12) % 12;
  if (String(period).toUpperCase() === "PM") hour += 12;
  return hour;
}

export function formatEasternTimeLabel(hour24, minute = 0) {
  const { hour12, period } = hour24To12(hour24);
  const min = Number(minute) || 0;
  return `${hour12}:${String(min).padStart(2, "0")} ${period} ET`;
}

export function easternToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

const CHURCH_TIMEZONE = "America/New_York";

export function easternNowParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CHURCH_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return {
    hour: parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10),
    minute: parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10),
  };
}

export function hasScheduledPublishTime(row) {
  return Number.isFinite(Number(row?.publish_hour));
}

export function isPublishTimeReached(row, now = new Date()) {
  if (!row?.devotion_date || !hasScheduledPublishTime(row)) return false;

  const today = easternToday();
  const dateCmp = row.devotion_date === today ? 0 : row.devotion_date < today ? -1 : 1;
  if (dateCmp > 0) return false;
  if (dateCmp < 0) return true;

  const hour = Number(row.publish_hour);
  const minute = Number.isFinite(Number(row.publish_minute)) ? Number(row.publish_minute) : 0;
  const parts = easternNowParts(now);

  if (parts.hour > hour) return true;
  if (parts.hour === hour && parts.minute >= minute) return true;
  return false;
}