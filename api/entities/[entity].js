import { getEntityConfig } from '../lib/entityConfig.js';
import { getUserFromRequest } from '../lib/auth.js';
import {
  listEntities,
  createEntity,
  canPublicRead,
  canPublicCreate,
} from '../lib/entities.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

export default async function handler(req, res) {
  const { entity } = req.query;
  const config = getEntityConfig(entity);

  if (!config) {
    return res.status(404).json({ error: 'Unknown entity', entity });
  }

  if (req.method === 'GET') {
    if (!isSupabaseConfigured()) {
      return res.status(200).json([]);
    }

    const user = await getUserFromRequest(req);
    const isAdmin = user?.role === 'admin';

    if (!isAdmin && !canPublicRead(entity, config)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const sort = req.query.sort || '-created_date';
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      if (!isAdmin && entity === 'PrayerRequest') {
        filter.is_public = true;
      }

      const rows = await listEntities(entity, { filter, sort, limit });
      return res.status(200).json(rows);
    } catch (err) {
      console.error(`GET ${entity}:`, err);
      return res.status(500).json({ error: err.message || 'Query failed' });
    }
  }

  if (req.method === 'POST') {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Add Supabase environment variables in Vercel.',
      });
    }

    const user = await getUserFromRequest(req);
    const isAdmin = user?.role === 'admin';

    if (!isAdmin && !canPublicCreate(entity, config)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const row = await createEntity(entity, req.body || {});
      return res.status(201).json(row);
    } catch (err) {
      console.error(`POST ${entity}:`, err);
      return res.status(err.status || 500).json({ error: err.message || 'Create failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}