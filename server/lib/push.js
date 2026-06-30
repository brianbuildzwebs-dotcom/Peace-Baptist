import webpush from 'web-push';
import { getSupabaseAdmin } from './supabase.js';

const CHURCH_TIMEZONE = 'America/New_York';

function normalizeSiteUrl(raw) {
  let cleaned = String(raw || 'https://peacebaptist.net').trim().replace(/\/$/, '');
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned.replace(/^\/+/, '')}`;
  }
  return cleaned.replace(/\s+/g, '');
}

const SITE_URL = normalizeSiteUrl(process.env.SITE_URL);

function buildPushUrl(path) {
  const route = String(path || '/').trim();
  if (/^https?:\/\//i.test(route)) {
    return route.replace(/\s+/g, '');
  }
  const suffix = route.startsWith('/') ? route : `/${route}`;
  return `${SITE_URL}${suffix}`;
}

let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return true;
  const publicKey = getVapidPublicKey();
  const privateKey = getVapidPrivateKey();
  const subject = vapidSubject();
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

function cleanVapidEnv(raw) {
  return String(raw || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, '');
}

function normalizeVapidPublicKey(raw) {
  const cleaned = cleanVapidEnv(raw);
  // web-push public keys are ~87–88 URL-safe base64 characters.
  if (!/^[A-Za-z0-9_-]{65,90}$/.test(cleaned)) return null;
  return cleaned;
}

function normalizeVapidPrivateKey(raw) {
  const cleaned = cleanVapidEnv(raw);
  // web-push private keys are ~43 URL-safe base64 characters (not the same length as public).
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(cleaned)) return null;
  return cleaned;
}

function vapidSubject() {
  const raw = process.env.VAPID_SUBJECT?.trim()
    || process.env.ADMIN_EMAIL?.trim()
    || 'peacebible@bellsouth.net';
  if (/^mailto:/i.test(raw) || /^https?:\/\//i.test(raw)) return raw;
  return `mailto:${raw}`;
}

export function getVapidPublicKey() {
  return normalizeVapidPublicKey(process.env.VAPID_PUBLIC_KEY);
}

export function getVapidPrivateKey() {
  return normalizeVapidPrivateKey(process.env.VAPID_PRIVATE_KEY);
}

export function isPushConfigured() {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}

function easternHour() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CHURCH_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const hour = parts.find((p) => p.type === 'hour')?.value;
  return parseInt(hour ?? '0', 10);
}

function easternDateString() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CHURCH_TIMEZONE }).format(new Date());
}

async function listSubscriptionsForTopic(topic) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .contains('topics', [topic]);

  if (error) throw error;
  return data || [];
}

async function removeSubscription(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from('push_subscriptions').delete().eq('id', id);
}

export async function savePushSubscription({ endpoint, keys, topics, userAgent }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  const row = {
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    topics: Array.isArray(topics) && topics.length ? topics : ['daily_walk', 'prayer', 'live'],
    user_agent: userAgent || null,
  };

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(row, { onConflict: 'endpoint' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deletePushSubscription(endpoint) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
}

export async function countPushSubscriptions() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('push_subscriptions')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

export async function sendTopicPush(topic, { title, body, url, tag }) {
  if (!configureVapid()) {
    console.warn('Web push skipped: VAPID keys not configured');
    return { sent: 0, failed: 0, skipped: true };
  }

  const subs = await listSubscriptionsForTopic(topic);
  let sent = 0;
  let failed = 0;
  const payload = JSON.stringify({
    title,
    body,
    url: buildPushUrl(url),
    tag: tag || topic,
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent += 1;
    } catch (err) {
      failed += 1;
      if (err.statusCode === 401 || err.statusCode === 403 || err.statusCode === 404 || err.statusCode === 410) {
        await removeSubscription(sub.id);
      }
      console.warn('Push delivery failed:', err.statusCode || err.message);
    }
  }

  return { sent, failed, total: subs.length };
}

export async function notifyNewPrayerRequest(row) {
  const label = row.is_anonymous
    ? 'A new anonymous prayer request was shared.'
    : 'A new prayer request was shared.';
  return sendTopicPush('prayer', {
    title: 'Peace Baptist — Prayer Request',
    body: label,
    url: '/prayer-requests',
    tag: 'prayer-new',
  });
}

export async function notifyLiveStream() {
  return sendTopicPush('live', {
    title: 'Peace Baptist — We\'re Live!',
    body: 'Sunday service is streaming now. Tap to watch.',
    url: '/watch-live',
    tag: 'live-now',
  });
}

export async function sendDailyWalkNotification({ force = false, fromCron = false } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  if (!force && !fromCron) {
    const notifyHour = await getDailyWalkNotifyHour();
    if (easternHour() !== notifyHour) {
      return { skipped: true, reason: 'outside_notify_window', hour: easternHour(), notifyHour };
    }
  }

  const today = easternDateString();
  const { data: devotion, error } = await supabase
    .from('daily_devotions')
    .select('*')
    .eq('devotion_date', today)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  if (!devotion) return { skipped: true, reason: 'no_devotion', date: today };
  if (!force && devotion.notification_sent_at) {
    return { skipped: true, reason: 'already_sent', date: today };
  }

  const snippet = devotion.scripture_reference
    ? `${devotion.scripture_reference} — ${(devotion.scripture_text || '').slice(0, 80)}`
    : (devotion.message || '').slice(0, 120);

  const result = await sendTopicPush('daily_walk', {
    title: devotion.title || 'Daily Walk',
    body: snippet || 'Tap to read today\'s devotion.',
    url: '/daily-walk',
    tag: `daily-walk-${today}`,
  });

  if (result.sent > 0 || force) {
    await supabase
      .from('daily_devotions')
      .update({ notification_sent_at: new Date().toISOString() })
      .eq('id', devotion.id);
  }

  return { ...result, date: today, devotionId: devotion.id };
}

async function getSiteSettingValue(key) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return data?.value ?? null;
}

async function setSiteSettingValue(key, label, value) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase
    .from('site_settings')
    .upsert({ key, label, value }, { onConflict: 'key' });
}

async function getDailyWalkNotifyHour() {
  const hour = parseInt(await getSiteSettingValue('daily_walk_notify_hour') ?? '7', 10);
  return Number.isFinite(hour) ? hour : 7;
}

function easternNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CHURCH_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  }).formatToParts(new Date());

  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { hour, minute, day: dayMap[weekday] ?? 0 };
}

const DEFAULT_PUSH_SCHEDULES = [
  {
    id: 'daily_walk_morning',
    type: 'daily_walk',
    hour: 7,
    minute: 0,
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    topic: 'daily_walk',
  },
];

async function getPushSchedules() {
  const raw = await getSiteSettingValue('push_schedules');
  if (!raw) return DEFAULT_PUSH_SCHEDULES;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_PUSH_SCHEDULES;
  } catch {
    return DEFAULT_PUSH_SCHEDULES;
  }
}

async function getScheduleSentLog() {
  const raw = await getSiteSettingValue('push_schedule_sent_log');
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveScheduleSentLog(log) {
  await setSiteSettingValue('push_schedule_sent_log', 'Push schedule sent log', JSON.stringify(log));
}

function scheduleMatchesNow(schedule, now) {
  if (!schedule?.enabled) return false;
  if (!Array.isArray(schedule.days) || !schedule.days.includes(now.day)) return false;
  return Number(schedule.hour) === now.hour && Number(schedule.minute ?? 0) === now.minute;
}

export async function runScheduledPushes() {
  const now = easternNow();
  const today = easternDateString();
  const schedules = await getPushSchedules();
  const sentLog = await getScheduleSentLog();
  const results = [];

  for (const schedule of schedules) {
    if (!scheduleMatchesNow(schedule, now)) continue;
    if (sentLog[schedule.id] === today) {
      results.push({ scheduleId: schedule.id, skipped: true, reason: 'already_sent_today' });
      continue;
    }

    let result;
    if (schedule.type === 'daily_walk') {
      result = await sendDailyWalkNotification({ fromCron: true });
    } else if (schedule.type === 'live') {
      result = await notifyLiveStream();
    } else if (schedule.type === 'custom') {
      result = await sendTopicPush(schedule.topic || 'live', {
        title: schedule.title || 'Peace Baptist Church',
        body: schedule.body || '',
        url: schedule.url || '/',
        tag: `schedule-${schedule.id}-${today}`,
      });
    } else {
      result = { skipped: true, reason: 'unknown_type' };
    }

    if (!result?.skipped) {
      sentLog[schedule.id] = today;
    }

    results.push({ scheduleId: schedule.id, type: schedule.type, ...result });
  }

  if (results.some((r) => !r.skipped)) {
    await saveScheduleSentLog(sentLog);
  }

  return { now, results };
}