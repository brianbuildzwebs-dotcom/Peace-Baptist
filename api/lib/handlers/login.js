import { getSupabaseAdmin, isSupabaseConfigured } from '../supabase.js';

export async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: 'Auth not configured',
      message: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, then redeploy.',
    });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message || 'Invalid credentials' });
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'user',
    },
  });
}