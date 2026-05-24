import { parseResponse } from './parseResponse';
import { ApiError } from './api-error';

export async function authFetch(
  url: string,
  options: RequestInit,
  accessToken: string | null,
  refreshAccessToken: () => Promise<string | null>,
  logout: () => Promise<void>
) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      await logout();
      throw new ApiError('Sessão expirada', 401);
    }

    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  return parseResponse(response);
}
