export default async function handler(req, res) {
  const { entity } = req.query;

  if (req.method === 'GET') {
    // Shell mode: empty data until Supabase is connected.
    return res.status(200).json([]);
  }

  if (req.method === 'POST') {
    return res.status(201).json({
      id: crypto.randomUUID(),
      entity,
      ...req.body,
      created_date: new Date().toISOString(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}