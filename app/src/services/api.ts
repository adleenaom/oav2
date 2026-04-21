/**
 * API client for OpenAcademy existing Laravel API.
 *
 * Production: https://app.theopenacademy.org/api/
 * All endpoints are POST under /v3/ prefix.
 * Auth uses Z-TOKEN + Z-USER headers (not JWT Bearer).
 */

// Production (Coolify): nginx proxies /v3/, /auth/, /guest/ to theopenacademy.org → API_BASE = ''
// Local dev: direct to the API (may have CORS issues in browser, use proxy or test via curl)
const API_BASE = import.meta.env.VITE_API_URL || '';

// ---- Device ID (generated once, persisted) ----

function getDeviceId(): string {
  let id = localStorage.getItem('oa_device_id');
  if (!id) {
    id = 'pwa-' + crypto.randomUUID();
    localStorage.setItem('oa_device_id', id);
  }
  return id;
}

// ---- Token storage ----

const TOKEN_KEY = 'oa_auth_token';
const USER_ID_KEY = 'oa_auth_user_id';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setAuth(token: string, userId: number) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, String(userId));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

/** Get auth headers for use in external HTTP clients (e.g. hls.js) */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const userId = getUserId();
  const headers: Record<string, string> = {
    'Z-PLATFORM': 'web',
    'Z-VERSION': '1.0.0',
    'Z-DEVICEID': getDeviceId(),
  };
  if (token && userId) {
    headers['Z-TOKEN'] = token;
    headers['Z-USER'] = userId;
  }
  return headers;
}

// ---- Error ----

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown) {
    super(`API Error ${status}`);
    this.status = status;
    this.data = data;
  }
}

// ---- Core fetch ----

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const userId = getUserId();

  const headers: Record<string, string> = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'Z-PLATFORM': 'web',
    'Z-VERSION': '1.0.0',
    'Z-DEVICEID': getDeviceId(),
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token && userId) {
    headers['Z-TOKEN'] = token;
    headers['Z-USER'] = userId;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let data: unknown;
    try { data = await res.json(); } catch { data = null; }
    throw new ApiError(res.status, data);
  }

  return res.json();
}

/**
 * POST to v3 endpoint (all existing API endpoints are POST).
 */
export async function apiPost<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** SWR-compatible fetcher — uses POST for /v3/ endpoints */
export const fetcher = <T>(path: string) => {
  if (path.startsWith('/v3/')) {
    return apiPost<T>(path);
  }
  return apiFetch<T>(path);
};
