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