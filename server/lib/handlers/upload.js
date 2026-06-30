import { randomUUID } from 'crypto';
import { requireAdmin } from '../auth.js';
import { getSupabaseAdmin, getSupabaseUrl, isSupabaseConfigured } from '../supabase.js';

const BUCKET = 'site-uploads';
const MAX_BYTES = 4 * 1024 * 1024;

function parseBody(req) {
  const body = req.body;
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function extFromFilename(name, contentType) {
  const fromName = String(name || '').split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  if (contentType?.includes('png')) return 'png';
  if (contentType?.includes('webp')) return 'webp';
  if (contentType?.includes('gif')) return 'gif';
  return 'jpg';
}

export async function handleUpload(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: 'Storage not configured',
      message: 'Add Supabase environment variables in Vercel, then redeploy.',
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Storage not configured' });
  }

  const { filename, contentType, data } = parseBody(req);
  if (!data) {
    return res.status(400).json({ error: 'No file data provided' });
  }

  let buffer;
  try {
    buffer = Buffer.from(String(data), 'base64');
  } catch {
    return res.status(400).json({ error: 'Invalid file data' });
  }

  if (!buffer.length) {
    return res.status(400).json({ error: 'Empty file' });
  }

  if (buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: 'Image too large (max 4MB)' });
  }

  const mime = String(contentType || 'image/jpeg');
  if (!mime.startsWith('image/')) {
    return res.status(400).json({ error: 'Only image uploads are allowed' });
  }

  const ext = extFromFilename(filename, mime);
  const objectPath = `uploads/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: mime,
    upsert: false,
    cacheControl: '31536000',
  });

  if (error) {
    console.error('Supabase upload:', error);
    if (/bucket not found/i.test(error.message || '')) {
      return res.status(503).json({
        error: 'Upload storage is not set up yet',
        message: 'Run scripts/storage-setup.sql in the Supabase SQL Editor for this church project.',
      });
    }
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }

  const base = getSupabaseUrl()?.replace(/\/$/, '');
  const file_url = `${base}/storage/v1/object/public/${BUCKET}/${objectPath}`;

  return res.status(200).json({ file_url });
}