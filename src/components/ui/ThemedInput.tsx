import { TextInput, TextInputProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export function ThemedInput({ style, ...props }: TextInputProps) {
  const backgroundColor = useThemeColor({}, "inputBackground");
  const color = useThemeColor({}, "inputText");
  const borderColor = useThemeColor({}, "inputBorder");

  return (
    <TextInput
      style={[
        {
          backgroundColor,
          color,
          borderColor,
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        },
        style,
      ]}
      placeholderTextColor={borderColor}
      {...props}
    />
  );
}