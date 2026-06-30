import { handleHealth } from './lib/handlers/health.js';
import { handleLogin } from './lib/handlers/login.js';
import { handleMe, handleAuthAction } from './lib/handlers/auth.js';
import { handleEntityCollection, handleEntityById } from './lib/handlers/entities.js';
import { handleFunction } from './lib/handlers/functions.js';
import { handleUpload } from './lib/handlers/upload.js';

function getPathSegments(req) {
  const raw = req.query?.path;
  if (raw != null && raw !== '') {
    if (Array.isArray(raw)) return raw.filter(Boolean);
    return String(raw).split('/').filter(Boolean);
  }

  const url = req.url || '';
  const match = url.match(/\/api\/([^?]+)/);
  if (match?.[1]) return match[1].split('/').filter(Boolean);

  return [];
}

export default async function handler(req, res) {
  const segments = getPathSegments(req);

  if (segments.length === 0) {
    return res.status(404).json({ error: 'Not found', hint: 'No API path segments' });
  }

  const [root, second, third] = segments;

  try {
    if (root === 'health') return handleHealth(req, res);

    if (root === 'upload') return handleUpload(req, res);

    if (root === 'auth') {
      if (second === 'login') return handleLogin(req, res);
      if (second === 'me') return handleMe(req, res);
      if (second) return handleAuthAction(req, res, second);
      return res.status(404).json({ error: 'Not found' });
    }

    if (root === 'entities') {
      if (!second) return res.status(404).json({ error: 'Not found' });
      if (third) return handleEntityById(req, res, second, third);
      return handleEntityCollection(req, res, second);
    }

    if (root === 'functions' && second) {
      return handleFunction(req, res, second);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}