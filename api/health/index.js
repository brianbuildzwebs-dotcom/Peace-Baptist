import { isSupabaseConfigured } from '../lib/supabase.js';

function getSupabaseProjectRef() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] || null;
}

export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    supabase: isSupabaseConfigured(),
    supabaseProjectRef: getSupabaseProjectRef(),
    site: process.env.SITE_URL || null,
    checks: {
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    },
  });
}