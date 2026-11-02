/**
 * The auth JWT currently lives in localStorage (readable by any script on the page).
 * This module is the single place that touches it, so moving to an httpOnly cookie
 * later changes one file plus the API routes.
 */
export const AUTH_TOKEN_KEY = 'authToken';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}
