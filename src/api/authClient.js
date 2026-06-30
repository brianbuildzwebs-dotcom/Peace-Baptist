const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'peace_auth_token';

async function authRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/auth${path}`, { ...options, headers });

  if (!response.ok) {
    const error = new Error(`Auth error: ${response.status}`);
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch {
      error.data = null;
    }
    throw error;
  }

  return response.json();
}

export const authClient = {
  async me() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      const error = new Error('Not authenticated');
      error.status = 401;
      throw error;
    }
    return authRequest('/me');
  },

  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },

  async loginViaEmailPassword(email, password) {
    const result = await authRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.access_token) this.setToken(result.access_token);
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

  logout(redirectUrl) {
    this.setToken(null);
    if (redirectUrl) window.location.href = redirectUrl;
  },

  redirectToLogin(returnUrl) {
    const params = new URLSearchParams({ returnUrl: returnUrl || window.location.href });
    window.location.href = `/login?${params.toString()}`;
  },
};