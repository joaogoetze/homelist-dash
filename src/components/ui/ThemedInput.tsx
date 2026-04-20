import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export const ThemedInput = forwardRef<TextInput, TextInputProps>(
  ({ style, ...props }, ref) => {
    const backgroundColor = useThemeColor({}, "inputBackground");
    const color = useThemeColor({}, "inputText");
    const borderColor = useThemeColor({}, "inputBorder");

    return (
      <TextInput
        ref={ref} // 👈 ESSENCIAL
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
);