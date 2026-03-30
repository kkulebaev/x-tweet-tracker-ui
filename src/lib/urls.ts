export function isSameOriginUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.origin === window.location.origin;
  } catch {
    return false;
  }
}
