import { getEntityConfig } from '../entityConfig.js';
import { getUserFromRequest, requireAdmin } from '../auth.js';
import {
  listEntities,
  createEntity,
  getEntity,
  updateEntity,
  deleteEntity,
  canPublicRead,
  canPublicCreate,
} from '../entities.js';
import { isSupabaseConfigured } from '../supabase.js';
import { filterPublicSiteSettings } from '../publicSettings.js';
import { allowPublicCreate, isHoneypotTriggered } from '../rateLimit.js';

export async function handleEntityCollection(req, res, entity) {
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

      if (!isAdmin && entity === 'DailyDevotion') {
        filter.status = 'published';
      }

      let rows = await listEntities(entity, { filter, sort, limit });
      if (!isAdmin && entity === 'SiteSettings') {
        rows = filterPublicSiteSettings(rows);
      }
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

    const body = { ...(req.body || {}) };
    delete body._hp;
    delete body.website;
    delete body.company;

    if (!isAdmin && isHoneypotTriggered(req.body)) {
      return res.status(201).json({ id: crypto.randomUUID(), accepted: true });
    }

    const rateLimits = {
      ContactMessage: { max: 8, windowMinutes: 15 },
      PrayerRequest: { max: 12, windowMinutes: 15 },
      GivingRecord: { max: 8, windowMinutes: 15 },
      FormSubmission: { max: 10, windowMinutes: 15 },
    };
    const limit = rateLimits[entity];
    if (!isAdmin && limit) {
      const allowed = await allowPublicCreate(entity, limit);
      if (!allowed) {
        return res.status(429).json({ error: 'Too many submissions. Please try again in a few minutes.' });
      }
    }

    try {
      const row = await createEntity(entity, body);
      return res.status(201).json(row);
    } catch (err) {
      console.error(`POST ${entity}:`, err);
      return res.status(err.status || 500).json({ error: err.message || 'Create failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export async function handleEntityById(req, res, entity, id) {
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