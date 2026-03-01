import { useThemeColor } from '@/hooks/use-theme-color';
import { Text, TextProps } from 'react-native';

export function ThemedText({ style, ...props }: TextProps) {
  const color = useThemeColor({}, 'text');

  return <Text style={[{ color }, style]} {...props} />;
}