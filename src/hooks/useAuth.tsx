import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { API_BASE } from '@/config/env';

type AuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, userId: number) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  userId: number | null;
};

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  loading: true,
  login: async () => { },
  refreshAccessToken: async () => null,
  logout: async () => { },
  userId: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const ACCESS_TOKEN_KEY = 'access_token';
  const REFRESH_TOKEN_KEY = 'refresh_token';
  const USER_ID_KEY = 'user_id';

  useEffect(() => {
    loadTokens();
  }, []);

  async function loadTokens() {
    try {
      const storedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const storedUserId = await SecureStore.getItemAsync(USER_ID_KEY);

      if (storedAccessToken) setAccessToken(storedAccessToken);
      if (storedRefreshToken) {
        setRefreshToken(storedRefreshToken);
        refreshTokenRef.current = storedRefreshToken;
      }
      if (storedUserId) setUserId(Number(storedUserId))
    } finally {
      setLoading(false);
    }
  }

  async function login(newAccessToken: string, newRefreshToken: string, userId: number) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
    await SecureStore.setItemAsync(USER_ID_KEY, userId.toString());
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setUserId(userId);
    refreshTokenRef.current = newRefreshToken;
  }

  async function logout() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUserId(null);
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
      value={{
        accessToken,
        refreshToken,
        loading,
        login,
        logout,
        refreshAccessToken,
        userId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
