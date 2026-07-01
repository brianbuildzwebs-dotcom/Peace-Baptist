import { getAdminEmail, getFromEmail, isResendConfigured } from '../email.js';
import { getSupabaseAdmin, getSupabaseProjectRef, getSupabaseUrl, isSupabaseConfigured } from '../supabase.js';

export async function handleHealth(req, res) {
  let supabaseKeyValid = false;
  let supabaseKeyError = null;

  if (isSupabaseConfigured()) {
    try {
      const admin = getSupabaseAdmin();
      const { error } = await admin.from('profiles').select('id').limit(1);
      supabaseKeyValid = !error;
      supabaseKeyError = error?.message || null;
    } catch (err) {
      supabaseKeyError = err.message || 'Supabase connection failed';
    }
  }

  const detailSecret = process.env.HEALTH_DETAIL_SECRET?.trim();
  const wantsDetail = detailSecret
    && (req.headers.authorization === `Bearer ${detailSecret}` || req.query?.detail === detailSecret);

  const payload = {
    ok: supabaseKeyValid,
    supabase: isSupabaseConfigured(),
    supabaseKeyValid,
  };

  if (wantsDetail) {
    Object.assign(payload, {
      supabaseKeyError,
      supabaseProjectRef: getSupabaseProjectRef(),
      site: (process.env.SITE_URL || '').trim() || null,
      checks: {
        hasSupabaseUrl: Boolean(getSupabaseUrl()),
        hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
        hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim()),
        hasResendKey: isResendConfigured(),
        hasVapidKeys: Boolean(process.env.VAPID_PUBLIC_KEY?.trim() && process.env.VAPID_PRIVATE_KEY?.trim()),
        hasCronSecret: Boolean(process.env.CRON_SECRET?.trim()),
        adminEmail: getAdminEmail(),
        fromEmail: getFromEmail(),
      },
    });
  }

  return res.status(200).json(payload);
}