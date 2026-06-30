import { getEntityConfig } from '../../lib/entityConfig.js';
import { getUserFromRequest, requireAdmin } from '../../lib/auth.js';
import { getEntity, updateEntity, deleteEntity, canPublicRead } from '../../lib/entities.js';
import { isSupabaseConfigured } from '../../lib/supabase.js';

export default async function handler(req, res) {
  const { entity, id } = req.query;
  const config = getEntityConfig(entity);

  if (!config) {
    return res.status(404).json({ error: 'Unknown entity', entity });
  }

  if (!isSupabaseConfigured()) {
    if (req.method === 'GET') return res.status(404).json({ error: 'Not found', entity, id });
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    const user = await getUserFromRequest(req);
    const isAdmin = user?.role === 'admin';

    if (!isAdmin && !canPublicRead(entity, config)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const row = await getEntity(entity, id);
      if (!row) return res.status(404).json({ error: 'Not found', entity, id });

      if (!isAdmin && entity === 'PrayerRequest' && !row.is_public) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.status(200).json(row);
    } catch (err) {
      console.error(`GET ${entity}/${id}:`, err);
      return res.status(500).json({ error: err.message || 'Query failed' });
    }
  }

  if (req.method === 'PATCH') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
      const row = await updateEntity(entity, id, req.body || {});
      return res.status(200).json(row);
    } catch (err) {
      console.error(`PATCH ${entity}/${id}:`, err);
      return res.status(500).json({ error: err.message || 'Update failed' });
    }
  }

  if (req.method === 'DELETE') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
      await deleteEntity(entity, id);
      return res.status(204).end();
    } catch (err) {
      console.error(`DELETE ${entity}/${id}:`, err);
      return res.status(500).json({ error: err.message || 'Delete failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}