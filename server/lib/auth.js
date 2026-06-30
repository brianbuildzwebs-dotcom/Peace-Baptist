import { getSupabaseAdmin } from './supabase.js';

function readJwtAal(token) {
  if (!token) return null;
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    return payload.aal || 'aal1';
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;

  const token = auth.slice(7);
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_date')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    email: data.user.email,
    full_name: profile?.full_name || data.user.email,
    role: profile?.role || 'user',
    created_date: profile?.created_date || data.user.created_at,
  };
}

export async function requireAdmin(req, res) {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }

  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const aal = readJwtAal(token);
  if (aal !== 'aal2') {
    res.status(403).json({
      error: 'Admin MFA is required for this action.',
      code: 'mfa_required',
    });
    return null;
  }

  return user;
}