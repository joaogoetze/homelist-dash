import { Stack } from 'expo-router';
import Toast, { BaseToast } from 'react-native-toast-message';

const toastConfig = {
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#ab2222', backgroundColor: '#ab2222', height: 70, paddingHorizontal: 16 }}
      text1Style={{ color: '#fff', fontSize: 16 }}
      text2Style={{ color: '#fff', fontSize: 14 }}
    />
  ),
};

export default function AuthLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Criar conta' }} />
      </Stack>

      <Toast config={toastConfig} />
    </>
  );
}