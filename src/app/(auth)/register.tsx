import { ThemedInput } from "@/components/ui/ThemedInput";
import { API_BASE } from "@/config/env";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet, TextInput as RNTextInput, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Toast from 'react-native-toast-message';

const passwordRequirements = [
  { key: 'length', label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { key: 'special', label: 'Um caractere especial (!@#$%...)', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  { key: 'number', label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
  { key: 'upper', label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark
    ? { text: '#f2f2f7', sub: '#8e8e93', border: '#2c2c2e', success: '#34c759', error: '#ff453a' }
    : { text: '#1c1c1e', sub: '#8e8e93', border: '#e5e5ea', success: '#34c759', error: '#ff3b30' };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isDisabled = !name.trim() || !email.trim() || !password.trim() || loading || !isValidEmail;
  
  const passwordChecks = passwordRequirements.map(req => ({
    ...req,
    passed: req.test(password)
  }));
  const allPasswordChecksPassed = passwordChecks.every(c => c.passed);

async function handleRegister() {
    if (!isValidEmail) {
      Toast.show({
        type: 'error',
        text1: 'Email inválido',
        text2: 'Digite um email válido (algo@dominio.algo)',
      });
      return;
    }
    if (!allPasswordChecksPassed) {
      Toast.show({
        type: 'error',
        text1: 'Senha fraca',
        text2: failedChecks[0],
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      await login(data.accessToken, data.refreshToken);
      router.replace("/");
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível criar a conta',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Nome</Text>
          <ThemedInput
            placeholder="Nome"
            value={name}
            onChangeText={setName}
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <ThemedInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            ref={emailInputRef}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
          <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
          <ThemedInput
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            ref={passwordInputRef}
          />
          
          {password.length > 0 && (
            <View style={styles.requirementsContainer}>
              {passwordChecks.map((check) => (
                <View key={check.key} style={styles.requirementRow}>
                  <Text style={[
                    styles.requirementIcon, 
                    { color: check.passed ? colors.success : colors.sub }
                  ]}>
                    {check.passed ? '✓' : '○'}
                  </Text>
                  <Text style={[
                    styles.requirementLabel, 
                    { color: check.passed ? colors.success : colors.sub }
                  ]}>
                    {check.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, isDisabled && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={isDisabled}
          >
            <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.linkText}>
              Já tem conta? <Text style={styles.linkHighlight}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    width: '100%',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    // outros estilos específicos do ThemedInput podem ser sobrescritos aqui
  },
button: {
    width: '100%',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#73b775',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#c8e6c9',
  },
  requirementsContainer: {
    width: '100%',
    gap: 6,
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementIcon: {
    fontSize: 14,
    width: 18,
    textAlign: 'center',
  },
  requirementLabel: {
    fontSize: 13,
  },
  linkText: {
    marginTop: 12,
    color: '#8e8e93',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#28a745',
    fontWeight: '600',
  }
});