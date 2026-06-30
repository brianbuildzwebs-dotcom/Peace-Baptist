const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOPICS_KEY = 'pbc_push_topics';

function normalizeVapidPublicKey(raw) {
  return String(raw || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, '');
}

function urlBase64ToUint8Array(base64String) {
  const normalized = normalizeVapidPublicKey(base64String);
  if (!/^[A-Za-z0-9_-]{65,90}$/.test(normalized)) {
    throw new Error(
      'Push is misconfigured on the server. The VAPID public key in Vercel must be the key only — not a command or extra text.'
    );
  }
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const base64 = (normalized + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isPushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

export function getSavedTopics() {
  try {
    const raw = localStorage.getItem(TOPICS_KEY);
    if (!raw) return ['daily_walk', 'prayer', 'live'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : ['daily_walk', 'prayer', 'live'];
  } catch {
    return ['daily_walk', 'prayer', 'live'];
  }
}

export function saveTopics(topics) {
  localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await waitForServiceWorkerReady(registration);
  return registration;
}

async function waitForServiceWorkerReady(registration, attempts = 12) {
  if (registration?.active) return registration;

  for (let i = 0; i < attempts; i += 1) {
    const ready = await navigator.serviceWorker.ready.catch(() => null);
    if (ready?.active) return ready;
    await delay(250);
  }

  return registration;
}

export async function getPushPermission() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export async function fetchPushStatus() {
  const res = await fetch(`${API_BASE}/push/status`);
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      configured: false,
      publicKey: null,
      error: payload.error || 'Push is not configured on the server yet.',
    };
  }
  return payload;
}

export async function hasActivePushSubscription() {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return Boolean(subscription?.endpoint);
  } catch {
    return false;
  }
}

export async function subscribeToPush(topics = getSavedTopics()) {
  if (!isPushSupported()) throw new Error('Push notifications are not supported on this device.');

  const status = await fetchPushStatus();
  if (!status.configured || !status.publicKey) {
    throw new Error(
      status.error
        || 'Push is not configured on the server. An admin needs to set matching VAPID keys in Vercel and redeploy.'
    );
  }

  const registration = await registerServiceWorker();
  if (!registration?.pushManager) {
    throw new Error('Could not register the app service worker. Try again in a moment.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  // Replace any stale subscription (e.g. after VAPID key rotation or browser vs installed app).
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await fetch(`${API_BASE}/push/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: existing.endpoint }),
    }).catch(() => {});
    await existing.unsubscribe().catch(() => {});
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(status.publicKey),
  });

  const subRes = await fetch(`${API_BASE}/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      topics,
    }),
  });

  const subPayload = await subRes.json().catch(() => ({}));
  if (!subRes.ok) {
    const message = subPayload.error || 'Failed to save subscription.';
    if (message === 'Push not configured') {
      throw new Error(
        'Push is not fully configured on the server. Set both VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel (from the same npm run generate-vapid-keys output), then redeploy.'
      );
    }
    throw new Error(message);
  }

  saveTopics(topics);
  return { ok: true, topics };
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration('/');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  await fetch(`${API_BASE}/push/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  await subscription.unsubscribe();
}