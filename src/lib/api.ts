import { getApiBaseUrl, getApiToken } from './env';

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
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = joinUrl(getApiBaseUrl(), path);
  const token = getApiToken();

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
