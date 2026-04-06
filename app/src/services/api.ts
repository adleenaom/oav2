const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown) {
    super(`API Error ${status}`);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  return localStorage.getItem('oa_auth_token');
}

export function setToken(token: string) {
  localStorage.setItem('oa_auth_token', token);
}

export function clearToken() {
  localStorage.removeItem('oa_auth_token');
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let data: unknown;
    try { data = await res.json(); } catch { data = null; }
    throw new ApiError(res.status, data);
  }

  return res.json();
}

/** SWR-compatible fetcher */
export const fetcher = <T>(path: string) => apiFetch<T>(path);
