import React, { forwardRef } from "react";
import { TextInput, TextInputProps, View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

export const ThemedInput = forwardRef<TextInput, TextInputProps & {
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  rightIconColor?: string;
}>(
  ({ style, rightIcon, onRightIconPress, rightIconColor, ...props }, ref) => {
    const backgroundColor = useThemeColor({}, "inputBackground");
    const color = useThemeColor({}, "inputText");
    const borderColor = useThemeColor({}, "inputBorder");
    const iconColor = rightIconColor || borderColor;

    const inputStyle = [
      {
        backgroundColor,
        color,
        borderColor,
        borderWidth: 1,
        padding: 12,
        paddingRight: rightIcon ? 44 : 12,
        borderRadius: 8,
        marginBottom: 12,
      },
      style,
    ];

    return (
      <View>
        <TextInput
          ref={ref}
          style={inputStyle}
          placeholderTextColor={borderColor}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={rightIcon} size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

ThemedInput.displayName = "ThemedInput";

const styles = StyleSheet.create({
  rightIconContainer: {
    position: "absolute",
    right: 12,
    top: 14,
  },
});