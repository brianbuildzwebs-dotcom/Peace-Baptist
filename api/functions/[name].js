export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;

  // Shell mode: acknowledge function calls (e.g. notifyNewPrayer).
  return res.status(200).json({ success: true, function: name });
}