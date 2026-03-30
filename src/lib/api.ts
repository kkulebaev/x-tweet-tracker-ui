import { getApiBaseUrl, getApiToken } from './env';
import { isSameOriginUrl } from './urls';

function isRelativeUrl(s: string): boolean {
  return s.startsWith('/');
}

export type AccountDTO = {
  id: string;
  xUsername: string;
  enabled: boolean;
  sinceId: string | null;
};

type ListAccountsResponse = {
  accounts: AccountDTO[];
};

type GetAccountResponse = {
  account: AccountDTO;
};

type AddAccountResponse = {
  account: AccountDTO;
};

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/g, '');
  if (path.startsWith('/')) return `${b}${path}`;
  return `${b}/${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = joinUrl(base, path);
  const token = getApiToken();

  // If API_BASE_URL points to the UI origin (and it's not a relative URL), we'd fetch index.html.
  // Relative base URLs are allowed intentionally (same-origin proxy setup).
  if (!isRelativeUrl(base) && isSameOriginUrl(url)) {
    throw new Error(
      `API_BASE_URL points to the UI origin (${window.location.origin}). ` +
        `Set VITE_API_BASE_URL to the API service URL (or use a relative URL like "/api" for a proxy).`,
    );
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  if (!isJson) {
    const text = await res.text().catch(() => '');
    throw new Error(`API returned non-JSON response: ${text.slice(0, 200)}`);
  }

  return (await res.json()) as T;
}

export async function apiListAccounts(): Promise<ListAccountsResponse> {
  return requestJson<ListAccountsResponse>('/admin/accounts');
}

export async function apiGetAccount(id: string): Promise<GetAccountResponse> {
  return requestJson<GetAccountResponse>(`/admin/accounts/${encodeURIComponent(id)}`);
}

export async function apiAddAccount(xUsername: string): Promise<AddAccountResponse> {
  return requestJson<AddAccountResponse>('/admin/accounts', {
    method: 'POST',
    body: JSON.stringify({ xUsername }),
  });
}

export async function apiToggleAccount(id: string, enabled: boolean): Promise<GetAccountResponse> {
  return requestJson<GetAccountResponse>(`/admin/accounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}

export async function apiDeleteAccount(id: string): Promise<void> {
  await requestJson<unknown>(`/admin/accounts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
