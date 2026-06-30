import { getPeaceAccessToken } from '@/lib/auth-session';
import { notifyAdminMfaRequired } from '@/lib/mfa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function buildQuery({ filter, sort, limit } = {}) {
  const params = new URLSearchParams();
  if (filter && Object.keys(filter).length > 0) {
    params.set('filter', JSON.stringify(filter));
  }
  if (sort) params.set('sort', sort);
  if (limit != null) params.set('limit', String(limit));
  const query = params.toString();
  return query ? `?${query}` : '';
}

async function request(path, options = {}) {
  const token = await getPeaceAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const error = new Error(`API error: ${response.status}`);
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch {
      error.data = null;
    }
    if (error.data?.code === 'mfa_required') {
      notifyAdminMfaRequired();
    }
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

function createEntityClient(entityName) {
  const basePath = `/entities/${entityName}`;

  return {
    async filter(filter = {}, sort, limit) {
      return request(`${basePath}${buildQuery({ filter, sort, limit })}`);
    },

    async list(sort, limit) {
      return request(`${basePath}${buildQuery({ sort, limit })}`);
    },

    async get(id) {
      return request(`${basePath}/${id}`);
    },

    async create(data) {
      return request(basePath, { method: 'POST', body: JSON.stringify(data) });
    },

    async update(id, data) {
      return request(`${basePath}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },

    async delete(id) {
      return request(`${basePath}/${id}`, { method: 'DELETE' });
    },

    subscribe(callback, { intervalMs = 15000, filter = {}, sort, limit } = {}) {
      let knownIds = new Set();

      const poll = async () => {
        try {
          const rows = await request(`${basePath}${buildQuery({ filter, sort, limit })}`);
          const list = Array.isArray(rows) ? rows : [];
          for (const row of list) {
            if (!knownIds.has(row.id)) {
              callback({ type: "create", data: row });
            }
          }
          knownIds = new Set(list.map((row) => row.id));
        } catch {
          // ignore polling errors
        }
      };

      poll();
      const interval = setInterval(poll, intervalMs);
      return () => clearInterval(interval);
    },
  };
}

export { createEntityClient };