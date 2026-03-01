import { useThemeColor } from '@/hooks/use-theme-color';
import { View, ViewProps } from 'react-native';

export function ThemedView({ style, ...props }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return <View style={[{ backgroundColor }, style]} {...props} />;
}