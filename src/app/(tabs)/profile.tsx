import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useColors } from '@/hooks/useColors';
import { API_BASE } from '@/config/env';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const router = useRouter();

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const { colors } = useColors();

  const getUser = async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE}/users/me`);
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, width: '100%' }}>
      <View style={styles.container}>
        {user && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.avatar, { backgroundColor: colors.border }]}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.name, { color: colors.text }]}>
              {user.name}
            </Text>

            <Text style={[styles.email, { color: colors.sub }]}>
              {user.email}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            Sair
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 28,
    fontWeight: '600',
  },

  name: {
    fontSize: 20,
    fontWeight: '600',
  },

  email: {
    fontSize: 14,
    marginTop: 4,
  },

  btn: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },

  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

});