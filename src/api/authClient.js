import {
  TOKEN_KEY,
  REFRESH_KEY,
  syncPeaceAuthFromSession,
  restoreSupabaseSession,
  logoutPeaceAuth,
  getPeaceAccessToken,
} from '@/lib/auth-session';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function authRequest(path, options = {}) {
  const token = await getPeaceAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/auth${path}`, { ...options, headers });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    const message =
      data?.error ||
      data?.message ||
      (response.status === 404 ? 'Login service not found. Try again in a minute.' : `Auth error: ${response.status}`);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return response.json();
}

export const authClient = {
  async me() {
    const token = await getPeaceAccessToken();
    if (!token) {
      const error = new Error('Not authenticated');
      error.status = 401;
      throw error;
    }
    return authRequest('/me');
  },

  setToken(token, refreshToken) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    else if (!token) localStorage.removeItem(REFRESH_KEY);
  },

  async restoreSession() {
    return restoreSupabaseSession();
  },

  async loginViaEmailPassword(email, password) {
    const result = await authRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.access_token) {
      this.setToken(result.access_token, result.refresh_token);
    }
    return result;
  },

  async register({ email, password }) {
    return authRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async verifyOtp({ email, otpCode }) {
    return authRequest('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  },

  async resendOtp(email) {
    return authRequest('/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPasswordRequest(email) {
    return authRequest('/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword({ resetToken, newPassword }) {
    return authRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  },

  loginWithProvider(_provider, _redirectUrl) {
    console.warn('OAuth login will be configured with Supabase Auth.');
  },

  async logout(redirectUrl) {
    await logoutPeaceAuth();
    syncPeaceAuthFromSession(null);
    if (redirectUrl) window.location.href = redirectUrl;
  },

  redirectToLogin(returnUrl) {
    const params = new URLSearchParams({ returnUrl: returnUrl || window.location.href });
    window.location.href = `/login?${params.toString()}`;
  },
};