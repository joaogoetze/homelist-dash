import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

export type Item = {
  id: number;
  serverId: number | null;
  text: string;
  checked: boolean;
};

interface TodoItemRowProps {
  item: Item;
  index: number;
  isLast: boolean;
  onToggleCheck: (id: number) => void;
  onUpdateText: (id: number, text: string) => void;
  onBlur: (item: Item) => void;
  onDelete: (item: Item) => void;
  onKeyPress: (e: any, id: number, index: number) => void;
  onFocus: () => void;
  inputRef?: React.Ref<TextInput>;
}

export const TodoItemRow = React.forwardRef<TextInput, TodoItemRowProps>(({
  item,
  index,
  isLast,
  onToggleCheck,
  onUpdateText,
  onBlur,
  onDelete,
  onKeyPress,
  onFocus,
}, ref) => {
  const { colors } = useColors();

  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: colors.border },
        isLast && styles.rowLast,
      ]}
    >
      <TouchableOpacity
        onPress={() => onToggleCheck(item.id)}
        style={[
          styles.checkbox,
          item.checked && { backgroundColor: colors.check, borderColor: colors.check },
          !item.checked && { borderColor: colors.sub },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {item.checked && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
      
      <TextInput
        ref={ref}
        onFocus={onFocus}
        onBlur={() => onBlur(item)}
        value={item.text}
        onChangeText={(text) => onUpdateText(item.id, text)}
        onKeyPress={(e) => onKeyPress(e, item.id, index)}
        blurOnSubmit={false}
        returnKeyType="next"
        placeholder="Item da lista..."
        placeholderTextColor={colors.sub}
        style={[
          styles.input,
          { color: item.checked ? colors.strikethrough : colors.text },
          item.checked && styles.strikethrough,
        ]}
        multiline={false}
      />
      
      <TouchableOpacity
        onPress={() => onDelete(item)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 0,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 6,
  },
  deleteText: {
    fontSize: 16,
  }
});
