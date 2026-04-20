import { ThemedInput } from "@/components/ui/ThemedInput";
import { API_BASE } from "@/config/env";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput as RNTextInput, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Toast from 'react-native-toast-message'

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const passwordInputRef = useRef<RNTextInput>(null);
    const colorScheme = useColorScheme();
    const isDisabled = !email.trim() || !password.trim() || loading;
    const isDark = colorScheme === 'dark';
    const colors = isDark
        ? { text: '#f2f2f7', sub: '#8e8e93', border: '#2c2c2e' }
        : { text: '#1c1c1e', sub: '#8e8e93', border: '#e5e5ea' };

async function handleLogin() {
    setLoading(true);
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao fazer login");
        }

        await login(data.accessToken, data.refreshToken);
        router.replace("/");

    } catch (error: any) {
        console.log("Erro login:", error.message);

        Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: error.message,
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
                    <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                    <ThemedInput 
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                    <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
                    <ThemedInput
                        placeholder="Senha"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                        ref={passwordInputRef}
                    />
                    <TouchableOpacity 
                        style={[styles.button, isDisabled && styles.buttonDisabled]} 
                        onPress={handleLogin}
                        disabled={isDisabled}
                    >
                        <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>
<TouchableOpacity onPress={() => router.push("/register")}>
                        <Text style={styles.linkText}>
                            Não tem conta? <Text style={styles.linkHighlight}>Criar conta</Text>
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
  maxWidth: 400,
  alignItems: 'stretch',
  gap: 16,
},
    label: {
        width: '100%',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
input: {
  width: '100%',
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
    secondaryButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextDisabled: {
        color: '#b6e4b8',
    },
    linkText: {
  marginTop: 12,
  color: '#8e8e93',
  fontSize: 14,
  textAlign: 'center',
},
linkHighlight: {
  color: '#28a745',
  fontWeight: '600',
}
});