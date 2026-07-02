export const CHURCH_TIMEZONE = 'America/New_York';

export function easternDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CHURCH_TIMEZONE }).format(date);
}

export function easternNowParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CHURCH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(date);

  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return { hour, minute, day: dayMap[weekday] ?? 0 };
}

export function hour24To12(hour24) {
  const normalized = ((Number(hour24) % 24) + 24) % 24;
  const period = normalized >= 12 ? 'PM' : 'AM';
  const hour12 = normalized % 12 || 12;
  return { hour12, period };
}

export function hour12To24(hour12, period) {
  let hour = Number(hour12) % 12;
  if (String(period).toUpperCase() === 'PM') hour += 12;
  return hour;
}

export function formatEasternTimeLabel(hour24, minute = 0) {
  const { hour12, period } = hour24To12(hour24);
  const min = Number(minute) || 0;
  return `${hour12}:${String(min).padStart(2, '0')} ${period} ET`;
}

export function compareDatesYmd(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function hasScheduledPublishTime(row) {
  return Number.isFinite(Number(row?.publish_hour));
}

export function isPublishTimeReached(row, now = new Date()) {
  if (!row?.devotion_date || !hasScheduledPublishTime(row)) return false;

  const today = easternDateString(now);
  const dateCmp = compareDatesYmd(row.devotion_date, today);
  if (dateCmp > 0) return false;
  if (dateCmp < 0) return true;

  const hour = Number(row.publish_hour);
  const minute = Number.isFinite(Number(row.publish_minute)) ? Number(row.publish_minute) : 0;
  const parts = easternNowParts(now);

  if (parts.hour > hour) return true;
  if (parts.hour === hour && parts.minute >= minute) return true;
  return false;
}

export function isDevotionPubliclyVisible(row, now = new Date()) {
  if (!row || row.status === 'draft') return false;
  if (row.status === 'published' && row.publish_hour == null && row.publish_minute == null) {
    return true;
  }
  if (row.status === 'scheduled') {
    return hasScheduledPublishTime(row) && isPublishTimeReached(row, now);
  }
  if (row.status === 'published') {
    return hasScheduledPublishTime(row) ? isPublishTimeReached(row, now) : true;
  }
  return false;
}