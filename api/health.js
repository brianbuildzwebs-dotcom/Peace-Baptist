import { isSupabaseConfigured } from './lib/supabase.js';

export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    supabase: isSupabaseConfigured(),
    site: process.env.SITE_URL || null,
  });
}