import { getEntityConfig } from './entityConfig.js';
import { getSupabaseAdmin } from './supabase.js';

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

export function isHoneypotTriggered(body) {
  if (!body || typeof body !== 'object') return false;
  const trap = body._hp ?? body.website ?? body.company;
  return typeof trap === 'string' && trap.trim().length > 0;
}

/**
 * Global per-entity create throttle (no extra DB table required).
 * Returns true when the request should be allowed.
 */
export async function allowPublicCreate(entity, { max = 10, windowMinutes = 10 } = {}) {
  const config = getEntityConfig(entity);
  if (!config?.table) return true;

  const supabase = getSupabaseAdmin();
  if (!supabase) return true;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from(config.table)
    .select('*', { count: 'exact', head: true })
    .gte('created_date', since);

  if (error) {
    console.warn(`Rate limit check failed for ${entity}:`, error.message);
    return true;
  }

  return (count ?? 0) < max;
}

export async function allowPushSubscribe(req, { max = 20, windowMinutes = 60 } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return true;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('push_subscriptions')
    .select('*', { count: 'exact', head: true })
    .gte('created_date', since);

  if (error) {
    console.warn('Push subscribe rate limit check failed:', error.message);
    return true;
  }

  return (count ?? 0) < max;
}