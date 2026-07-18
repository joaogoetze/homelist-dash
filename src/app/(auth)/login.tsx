import { ThemedInput } from '@/components/ui/ThemedInput';
import { API_BASE } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput as RNTextInput, ScrollView } from 'react-native';
import { handleError } from '@/services/errorHandler';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { parseResponse } from '@/services/parseResponse';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 
    const router = useRouter();
    const { login } = useAuth();
    const { colors } = useColors();
    const passwordInputRef = useRef<RNTextInput>(null);
    const isDisabled = !email.trim() || !password.trim() || loading;

    async function handleLogin() {
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await parseResponse(response);
            
            await login(data.accessToken, data.refreshToken, data.userId);

            router.replace("/");
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAwareScrollView   
            bottomOffset={24}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.form}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        Email
                    </Text>
                    <ThemedInput 
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                    <Text style={[styles.label, { color: colors.text }]}>
                        Senha
                    </Text>
                    <ThemedInput
                        placeholder="Senha"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry={!showPassword}
                        ref={passwordInputRef}
                        rightIcon={showPassword ? "eye-off" : "eye" as any}
                        onRightIconPress={() => setShowPassword(!showPassword)}
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
                            Não tem conta?{' '}
                            <Text style={styles.linkHighlight}>
                                Criar conta
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAwareScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'stretch',
        gap: 10,
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
    },
});