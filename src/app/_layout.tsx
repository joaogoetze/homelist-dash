import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { accessToken, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if(loading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!accessToken && !inAuthGroup) {
      router.replace('/login');
    }

    if (accessToken && inAuthGroup) {
      router.replace('/');
    }
  }, [accessToken, segments, loading, router]);

  if (loading) return null;

  return <>{children}</>;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

        <AuthGate>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
              name="list/[id]"
              options={{
                headerShown: true,
                headerBackTitle: 'Listas',
                headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
              }}
            />
          </Stack>
        </AuthGate>

        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}