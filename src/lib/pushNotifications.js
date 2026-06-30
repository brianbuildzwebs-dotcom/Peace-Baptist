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
  if (!/^[A-Za-z0-9_-]{80,90}$/.test(normalized)) {
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
  return navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

export async function getPushPermission() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export async function subscribeToPush(topics = getSavedTopics()) {
  if (!isPushSupported()) throw new Error('Push notifications are not supported on this device.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  const keyRes = await fetch(`${API_BASE}/push/vapid-public-key`);
  const keyPayload = await keyRes.json().catch(() => ({}));
  if (!keyRes.ok || !keyPayload.publicKey) {
    throw new Error(keyPayload.error || 'Push is not configured on the server yet.');
  }

  const registration = await registerServiceWorker();
  if (!registration) throw new Error('Could not register the app service worker.');

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyPayload.publicKey),
    });
  }

  const subRes = await fetch(`${API_BASE}/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      topics,
    }),
  });

  const subPayload = await subRes.json().catch(() => ({}));
  if (!subRes.ok) throw new Error(subPayload.error || 'Failed to save subscription.');

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