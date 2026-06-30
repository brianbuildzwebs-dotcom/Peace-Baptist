import { isSupabaseConfigured } from '../lib/supabase.js';

export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    supabase: isSupabaseConfigured(),
    site: process.env.SITE_URL || null,
    checks: {
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    },
  });
}