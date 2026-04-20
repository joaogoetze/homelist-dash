import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { authFetch } from '@/services/api';

export function useAuthenticatedFetch() {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  return useCallback(
    (url: string, options: RequestInit = {}) =>
      authFetch(url, options, accessToken, refreshAccessToken, logout),
    [accessToken, refreshAccessToken, logout]
  );
}
