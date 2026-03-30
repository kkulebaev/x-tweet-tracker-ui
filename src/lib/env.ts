function mustGetEnv(key: string): string {
  const v = import.meta.env[key] as unknown;
  if (typeof v === 'string' && v.trim() !== '') return v;
  throw new Error(`Missing required env var: ${key}`);
}

export function getApiBaseUrl(): string {
  const raw = mustGetEnv('VITE_API_BASE_URL').trim();

  // Allow relative URLs (e.g. "/api") so the UI can talk to a same-origin proxy.
  if (raw.startsWith('/')) return raw.replace(/\/$/g, '');

  // Allow host-only values like "x-tweet-tracker.railway.internal" (will become "https://...").
  if (!/^https?:\/\//i.test(raw)) {
    return `https://${raw}`.replace(/\/$/g, '');
  }

  return raw.replace(/\/$/g, '');
}

export function getApiToken(): string {
  return mustGetEnv('VITE_API_TOKEN');
}
