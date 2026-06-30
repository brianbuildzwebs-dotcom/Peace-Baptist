const NOT_CONFIGURED = {
  error: 'Auth not configured yet',
  message: 'Admin auth will be enabled when Supabase is connected.',
};

export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method !== 'POST' && action !== 'me') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  switch (action) {
    case 'register':
    case 'verify-otp':
    case 'resend-otp':
    case 'reset-password-request':
    case 'reset-password':
    case 'login':
      return res.status(501).json(NOT_CONFIGURED);
    default:
      return res.status(404).json({ error: 'Unknown auth action' });
  }
}