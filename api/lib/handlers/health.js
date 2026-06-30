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

  return res.status(200).json({
    ok: supabaseKeyValid,
    supabase: isSupabaseConfigured(),
    supabaseKeyValid,
    supabaseKeyError,
    supabaseProjectRef: getSupabaseProjectRef(),
    site: (process.env.SITE_URL || '').trim() || null,
    checks: {
      hasSupabaseUrl: Boolean(getSupabaseUrl()),
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim()),
    },
  });
}