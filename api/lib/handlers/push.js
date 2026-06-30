import { requireAdmin } from '../auth.js';
import {
  deletePushSubscription,
  getVapidPublicKey,
  isPushConfigured,
  notifyLiveStream,
  savePushSubscription,
  sendDailyWalkNotification,
} from '../push.js';

function getCronSecret() {
  return process.env.CRON_SECRET?.trim() || null;
}

function authorizeCron(req) {
  const secret = getCronSecret();
  if (!secret) return false;
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${secret}` || auth === secret;
}

export async function handlePushVapidPublicKey(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const key = getVapidPublicKey();
  if (!key) {
    return res.status(503).json({ error: 'Push not configured', configured: false });
  }
  return res.status(200).json({ publicKey: key, configured: true });
}

export async function handlePushSubscribe(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isPushConfigured()) {
    return res.status(503).json({ error: 'Push not configured' });
  }

  const { subscription, topics } = req.body || {};
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription payload' });
  }

  try {
    const row = await savePushSubscription({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      topics,
      userAgent: req.headers['user-agent'],
    });
    return res.status(201).json({ ok: true, id: row.id });
  } catch (err) {
    console.error('Push subscribe:', err);
    return res.status(500).json({ error: err.message || 'Subscribe failed' });
  }
}

export async function handlePushUnsubscribe(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const endpoint = req.body?.endpoint;
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' });

  try {
    await deletePushSubscription(endpoint);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unsubscribe failed' });
  }
}

export async function handlePushCronDailyWalk(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!authorizeCron(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await sendDailyWalkNotification({ fromCron: true });
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error('Daily walk cron:', err);
    return res.status(500).json({ error: err.message || 'Cron failed' });
  }
}

export async function handlePushSendLive(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (!isPushConfigured()) {
    return res.status(503).json({ error: 'Push not configured' });
  }

  try {
    const result = await notifyLiveStream();
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error('Live push:', err);
    return res.status(500).json({ error: err.message || 'Send failed' });
  }
}

export async function handlePushSendDailyWalkNow(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (!isPushConfigured()) {
    return res.status(503).json({ error: 'Push not configured' });
  }

  try {
    const result = await sendDailyWalkNotification({ force: true });
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error('Daily walk send now:', err);
    return res.status(500).json({ error: err.message || 'Send failed' });
  }
}