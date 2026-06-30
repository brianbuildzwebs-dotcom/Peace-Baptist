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
  const token = localStorage.getItem('peace_auth_token');
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

    subscribe(_callback) {
      // Realtime will be wired up with Supabase later.
      return () => {};
    },
  };
}

export { createEntityClient };