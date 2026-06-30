export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Shell mode: auth will be wired to Supabase later.
  return res.status(401).json({ error: 'Auth not configured yet' });
}