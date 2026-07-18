import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ListDatabase } from '@/types/types';
import { useColors } from '@/hooks/useColors';

interface ListCardProps {
  item: ListDatabase;
  onPress: () => void;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  onRename: () => void;
  onDelete: () => void;
}

export function ListCard({
  item,
  onPress,
  onMenuToggle,
  isMenuOpen,
  onRename,
  onDelete,
}: ListCardProps) {
  const { colors } = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
          <Text style={styles.iconEmoji}>🛒</Text>
        </View>
        <Text style={[styles.listName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.menuBtn, { borderColor: colors.border }]}
        onPress={onMenuToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.menuDots, { color: colors.sub }]}>•••</Text>
      </TouchableOpacity>

      {isMenuOpen && (
        <View style={[styles.actionSheet, { backgroundColor: colors.sheet, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.actionRow} onPress={onRename}>
            <Text style={[styles.actionText, { color: colors.text }]}>✏️  Renomear</Text>
          </TouchableOpacity>
          <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.actionRow} onPress={onDelete}>
            <Text style={[styles.actionText, { color: colors.danger }]}>🗑️  Deletar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingRight: 48,
  },
  iconCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  iconEmoji: { 
    fontSize: 20 
  },
  listName: { 
    fontSize: 17, 
    fontWeight: '500',
    flex: 1 
  },
  menuBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    width: 32,
    justifyContent: 'center',
    borderRadius: 8,
  },
  menuDots: { 
    fontSize: 10, 
    letterSpacing: 1.5, 
    lineHeight: 14
  },
  actionSheet: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  actionRow: { 
    paddingVertical: 12, 
    paddingHorizontal: 16 
  },
  actionText: { 
    fontSize: 15 
  },
  actionDivider: {
    height: 0.5 
  },
});
