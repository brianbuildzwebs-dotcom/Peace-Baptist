import { getUserFromRequest } from '../auth.js';
import { getSupabaseAuth, isSupabaseConfigured } from '../supabase.js';

export async function handleMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isSupabaseConfigured()) {
    return res.status(401).json({ error: 'Auth not configured yet' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.status(200).json(user);
}

export async function handleAuthAction(req, res, action) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authClient = getSupabaseAuth();
  if (!authClient) {
    return res.status(503).json({
      error: 'Auth not configured',
      message: 'Add Supabase environment variables in Vercel.',
    });
  }

  switch (action) {
    case 'register':
      return res.status(403).json({
        error: 'Registration disabled',
        message: 'Admin accounts are created in Supabase. Contact the site administrator.',
      });

    case 'verify-otp':
    case 'resend-otp': {
      const { email, otpCode } = req.body || {};
      if (action === 'resend-otp') {
        const { error } = await authClient.auth.resend({ type: 'signup', email });
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      const { data, error } = await authClient.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup',
      });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({
        access_token: data.session?.access_token,
        user: data.user,
      });
    }

    case 'reset-password-request': {
      const { email } = req.body || {};
      const siteUrl = process.env.SITE_URL || 'https://peacebaptist.net';
      const { error } = await authClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
      });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    case 'reset-password':
      return res.status(400).json({
        error: 'Use the reset link from your email',
        message: 'Password reset is completed through the Supabase email link.',
      });

    default:
      return res.status(404).json({ error: 'Unknown auth action' });
  }
}