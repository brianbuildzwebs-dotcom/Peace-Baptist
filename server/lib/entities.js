import { getEntityConfig } from './entityConfig.js';
import { getSupabaseAdmin } from './supabase.js';
import { sendNotification } from './email.js';
import { notifyNewPrayerRequest } from './push.js';

function parseSort(sort) {
  if (!sort) return { column: 'created_date', ascending: false };
  const desc = sort.startsWith('-');
  const column = desc ? sort.slice(1) : sort;
  return { column, ascending: !desc };
}

function applyFilter(query, filter = {}) {
  let q = query;
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === null) continue;
    q = q.eq(key, value);
  }
  return q;
}

function normalizeEntityBody(entity, body = {}) {
  const payload = { ...body };
  delete payload._hp;
  delete payload.website;
  delete payload.company;

  if (entity === 'GivingRecord') {
    if (payload.email && !payload.donor_email) {
      payload.donor_email = payload.email;
    }
    delete payload.email;
    delete payload.frequency;
  }

  return payload;
}

function toApiRow(row, entity) {
  if (!row) return row;
  const result = { ...row };
  if (entity === 'CustomForm' && result.fields && typeof result.fields === 'string') {
    try {
      result.fields = JSON.parse(result.fields);
    } catch {
      result.fields = [];
    }
  }
  if (entity === 'FormSubmission' && result.data && typeof result.data === 'string') {
    try {
      result.data = JSON.parse(result.data);
    } catch {
      result.data = {};
    }
  }
  return result;
}

export async function listEntities(entity, { filter, sort, limit } = {}) {
  const config = getEntityConfig(entity);
  if (!config?.table) return [];

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { column, ascending } = parseSort(sort);
  let query = supabase.from(config.table).select('*').order(column, { ascending });
  query = applyFilter(query, filter);
  if (limit != null) query = query.limit(Number(limit));

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row) => toApiRow(row, entity));
}

export async function getEntity(entity, id) {
  const config = getEntityConfig(entity);
  if (!config?.table) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase.from(config.table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return toApiRow(data, entity);
}

export async function createEntity(entity, body) {
  const config = getEntityConfig(entity);
  if (!config?.table) {
    return { id: crypto.randomUUID(), entity, ...body, created_date: new Date().toISOString() };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const err = new Error('Database not configured');
    err.status = 503;
    throw err;
  }

  const payload = normalizeEntityBody(entity, body);
  const { data, error } = await supabase.from(config.table).insert(payload).select('*').single();
  if (error) throw error;

  const row = toApiRow(data, entity);
  if (config.notify) {
    await sendNotification(config.notify, row);
    if (config.notify === 'prayer') {
      notifyNewPrayerRequest(row).catch((err) => {
        console.warn('Prayer push notification failed:', err.message || err);
      });
    }
  }
  return row;
}

export async function updateEntity(entity, id, body) {
  const config = getEntityConfig(entity);
  if (!config?.table) return { id, entity, ...body };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const err = new Error('Database not configured');
    err.status = 503;
    throw err;
  }

  const { data, error } = await supabase.from(config.table).update(body).eq('id', id).select('*').single();
  if (error) throw error;
  return toApiRow(data, entity);
}

export async function deleteEntity(entity, id) {
  const config = getEntityConfig(entity);
  if (!config?.table) return;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const err = new Error('Database not configured');
    err.status = 503;
    throw err;
  }

  const { error } = await supabase.from(config.table).delete().eq('id', id);
  if (error) throw error;
}

export function canPublicRead(entity, config) {
  return config?.publicRead === true;
}

export function canPublicCreate(entity, config) {
  return config?.publicCreate === true;
}