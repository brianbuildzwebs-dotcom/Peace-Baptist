import { getUserFromRequest } from '../lib/auth.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

export default async function handler(req, res) {
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