import webpush from 'web-push';
import { getSupabaseAdmin } from './supabase.js';

const CHURCH_TIMEZONE = 'America/New_York';
const SITE_URL = (process.env.SITE_URL || 'https://peacebaptist.net').replace(/\/$/, '');

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
    url: url?.startsWith('http') ? url : `${SITE_URL}${url || '/'}`,
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
      if (err.statusCode === 404 || err.statusCode === 410) {
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

async function getDailyWalkNotifyHour() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 7;

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'daily_walk_notify_hour')
    .maybeSingle();

  const hour = parseInt(data?.value ?? '7', 10);
  return Number.isFinite(hour) ? hour : 7;
}