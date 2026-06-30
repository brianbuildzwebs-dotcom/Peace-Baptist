export default async function handler(req, res) {
  const { entity, id } = req.query;

  if (req.method === 'GET') {
    return res.status(404).json({ error: 'Not found', entity, id });
  }

  if (req.method === 'PATCH') {
    return res.status(200).json({ id, entity, ...req.body });
  }

  if (req.method === 'DELETE') {
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}