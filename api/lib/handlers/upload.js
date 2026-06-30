export async function handleUpload(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(501).json({
    error: 'Upload not configured yet',
    message: 'File uploads will be enabled in the next migration step.',
  });
}