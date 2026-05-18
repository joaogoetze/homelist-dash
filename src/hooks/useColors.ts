import { useColorScheme } from 'react-native';

const lightColors = {
  bg: '#f2f2f7',
  card: '#ffffff',
  text: '#1c1c1e',
  sub: '#8e8e93',
  border: '#e5e5ea',
  accent: '#34c759',
  success: '#34c759',
  danger: '#ff3b30',
  sheet: '#f9f9f9',
  check: '#34c759',
  strikethrough: '#8e8e93',
  inputBackground: '#f2f2f2',
  inputText: '#000',
  inputBorder: '#ccc',
};

const darkColors = {
  bg: '#0f0f0f',
  card: '#1c1c1e',
  text: '#f2f2f7',
  sub: '#8e8e93',
  border: '#2c2c2e',
  accent: '#34c759',
  success: '#34c759',
  danger: '#ff453a',
  sheet: '#2c2c2e',
  check: '#34c759',
  strikethrough: '#636366',
  inputBackground: '#1E1E1E',
  inputText: '#fff',
  inputBorder: '#333',
};

export type Colors = typeof lightColors;

export const useColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return { colors, isDark };
};
