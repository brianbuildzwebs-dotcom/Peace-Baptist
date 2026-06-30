import { getPeaceAccessToken } from '@/lib/auth-session';
import { notifyAdminMfaRequired } from '@/lib/mfa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function adminFetch(path, options = {}) {
  const token = await getPeaceAccessToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `API error: ${response.status}`);
    error.status = response.status;
    error.data = payload;
    if (payload.code === 'mfa_required') {
      notifyAdminMfaRequired();
    }
    throw error;
  }

  return payload;
}