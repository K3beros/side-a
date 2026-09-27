// Typed fetch wrapper — replaces the old admin.js api() + raw fetch calls.

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  body: T;
}

function googleToken(): string | null {
  try {
    return localStorage.getItem('side-a-google-id-token');
  } catch {
    return null;
  }
}

export function authHeaders(): Record<string, string> {
  const token = googleToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api<T>(path: string, opts?: RequestInit & { auth?: boolean }): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (opts?.body) headers['Content-Type'] = 'application/json';
  if (opts?.auth) Object.assign(headers, authHeaders());
  const res = await fetch(path, { ...opts, headers: { ...headers, ...(opts?.headers ?? {}) } });
  const body = (await res.json()) as T;
  return { ok: res.ok, status: res.status, body };
}

export async function get<T>(path: string, opts?: { auth?: boolean }): Promise<T> {
  const res = await fetch(path, {
    headers: opts?.auth ? authHeaders() : undefined,
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function post<T>(path: string, payload: unknown, opts?: { auth?: boolean }): Promise<ApiResult<T>> {
  return api<T>(path, { method: 'POST', body: JSON.stringify(payload), auth: opts?.auth });
}

export function fingerprint(): string {
  try {
    let fp = localStorage.getItem('side-a-fingerprint');
    if (!fp) {
      fp = `fp-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('side-a-fingerprint', fp);
    }
    return fp;
  } catch {
    return 'anon';
  }
}
