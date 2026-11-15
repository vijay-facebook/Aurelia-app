const ACCESS_TOKEN_KEY = 'aurelia_admin_access_token';
const REFRESH_TOKEN_KEY = 'aurelia_admin_refresh_token';

export const getToken = (): string => {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const getRefreshToken = (): string => {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setToken = (accessToken: string, refreshToken?: string) => {
  try {
    if (!accessToken) {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }

    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    /* Session storage may be unavailable in a locked-down browser. */
  }
};

export const clearToken = () => setToken('');

/**
 * All admin API calls carry a Supabase access token. If it expires, refresh
 * it once with the Supabase refresh token and retry the original request.
 */
export const adminFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const makeRequest = (token: string) => {
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    else headers.delete('Authorization');

    return fetch(input, {
      ...init,
      headers,
      credentials: 'same-origin',
    });
  };

  let response = await makeRequest(getToken());
  if (response.status !== 401 || String(input).includes('/api/admin/refresh')) {
    return response;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) return response;

  try {
    const refreshResponse = await fetch('/api/admin/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ refreshToken }),
    });
    const refreshed = await refreshResponse.json().catch(() => ({}));

    if (!refreshResponse.ok || !refreshed.access_token || !refreshed.refresh_token) {
      clearToken();
      return response;
    }

    setToken(refreshed.access_token, refreshed.refresh_token);
    response = await makeRequest(refreshed.access_token);
    if (response.status === 401 || response.status === 403) clearToken();
    return response;
  } catch {
    return response;
  }
};
