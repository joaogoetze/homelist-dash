import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { API_BASE } from '@/config/env';

type AuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  loading: true,
  login: async () => {},
  refreshAccessToken: async () => null,
  logout: async () => {},
});

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTokens();
  }, []);

  async function loadTokens() {
    try {
      const storedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (storedAccessToken) setAccessToken(storedAccessToken);
      if (storedRefreshToken) {
        setRefreshToken(storedRefreshToken);
        refreshTokenRef.current = storedRefreshToken;
      }
    } finally {
      setLoading(false);
    }
  }

  async function login(newAccessToken: string, newRefreshToken: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    refreshTokenRef.current = newRefreshToken;
  }

  async function logout() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    refreshTokenRef.current = null;
  }

  async function refreshAccessToken() {
    const currentRefresh = refreshTokenRef.current;
    try {
      if (!currentRefresh) {
        return null;
      }

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefresh }),
      });

      if (!response.ok) {
        await logout();
        return null;
      }

      const data = await response.json();

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
      setAccessToken(data.accessToken);

      return data.accessToken;
    } catch {
      await logout();
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshToken, loading, login, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
