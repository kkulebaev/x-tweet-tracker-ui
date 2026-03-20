import { mustEnv } from './env.js';

export type AccountDTO = {
  id: string;
  xUsername: string;
  enabled: boolean;
  sinceId: string | null;
};

export type RunResultDTO = {
  accountsTotal: number;
  accountsProcessed: number;
  tweetsInserted: number;
  errors: Array<{ xUsername: string; error: string }>;
};

function baseUrl() {
  let v = mustEnv('API_BASE_URL').trim().replace(/\/$/, '');

  const hasScheme = /^https?:\/\//i.test(v);

  // Allow setting internal Railway host without scheme, e.g. x-tweet-tracker.railway.internal
  if (!hasScheme) {
    const isRailwayInternal = /\.railway\.internal(?::\d+)?$/i.test(v);
    // Railway internal networking is typically plain HTTP and often needs an explicit port.
    const scheme = isRailwayInternal ? 'http' : 'https';
    v = `${scheme}://${v}`;
  }

  // If this is a railway.internal host and no port is provided, default to 8080.
  try {
    const u = new URL(v);
    if (u.hostname.toLowerCase().endsWith('.railway.internal') && !u.port) {
      u.port = '8080';
      v = u.toString().replace(/\/$/, '');
    }
  } catch {
    // ignore
  }

  return v;
}

function headers() {
  return {
    authorization: `Bearer ${mustEnv('API_TOKEN')}`,
    'content-type': 'application/json',
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = baseUrl() + path;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...headers(),
    },
  });

  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = json?.error || json?.message || json?.detail || `${res.status} ${res.statusText}`;
    throw new Error(`API error: ${msg}`);
  }

  return json as T;
}

export async function apiListAccounts() {
  return apiFetch<{ ok: true; accounts: AccountDTO[] }>('/admin/accounts');
}

export async function apiGetAccount(id: string) {
  return apiFetch<{ ok: true; account: AccountDTO }>(`/admin/accounts/${encodeURIComponent(id)}`);
}

export async function apiAddAccount(xUsername: string) {
  return apiFetch<{ ok: true; account: AccountDTO }>('/admin/accounts', {
    method: 'POST',
    body: JSON.stringify({ x_username: xUsername }),
  });
}

export async function apiToggleAccount(id: string, enabled: boolean) {
  return apiFetch<{ ok: true; account: AccountDTO }>(`/admin/accounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}

export async function apiDeleteAccount(id: string) {
  return apiFetch<{ ok: true }>(`/admin/accounts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

