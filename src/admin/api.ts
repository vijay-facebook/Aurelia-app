const KEY = 'aurelia_admin_token';

export const getToken = (): string => {
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

export const setToken = (token: string) => {
  try {
    if (token) sessionStorage.setItem(KEY, token);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* storage can be blocked (private window / embedded preview) - cookie login still works */
  }
};

/**
 * fetch() for admin endpoints. Sends the login token in a header as well as the cookie, so saving still
 * works when the browser blocks cookies (embedded preview frames, strict privacy settings).
 */
export const adminFetch = (input: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers, credentials: 'include' });
};
