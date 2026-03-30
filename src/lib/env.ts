function mustGetEnv(key: string): string {
  const v = import.meta.env[key] as unknown;
  if (typeof v === 'string' && v.trim() !== '') return v;
  throw new Error(`Missing required env var: ${key}`);
}

export function getApiBaseUrl(): string {
  return mustGetEnv('VITE_API_BASE_URL').replace(/\/$/g, '');
}

export function getApiToken(): string {
  return mustGetEnv('VITE_API_TOKEN');
}
