const BASE_URL = '/api/v1';

let accessToken = null;
let isRefreshing = false;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && accessToken && !isRefreshing) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        accessToken = data.data.accessToken;
        headers['Authorization'] = `Bearer ${accessToken}`;
        return fetch(`${BASE_URL}${endpoint}`, { ...options, headers, credentials: 'include' });
      }
      accessToken = null;
      window.location.href = '/login';
    } finally {
      isRefreshing = false;
    }
    return res;
  }

  return res;
}

export async function apiGet(endpoint) {
  const res = await apiFetch(endpoint);
  return res.json();
}

export async function apiPost(endpoint, body) {
  const res = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiPatch(endpoint, body) {
  const res = await apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiPut(endpoint, body) {
  const res = await apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete(endpoint) {
  const res = await apiFetch(endpoint, { method: 'DELETE' });
  return res.json();
}
