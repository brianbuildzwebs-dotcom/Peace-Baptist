export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(501).json({
    error: 'Auth not configured yet',
    message: 'Admin login will be enabled when Supabase Auth is connected.',
  });
}