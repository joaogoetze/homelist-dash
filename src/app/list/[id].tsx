import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListDetailScreen } from '@/hooks/useListDetailScreen';
import { TodoItemRow } from '@/components/items/TodoItemRow';
import { ShareModal } from '@/components/modals/ShareModal';

export default function ListDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, name, server_id } = useLocalSearchParams<{ id: string; name: string, server_id: string }>();
  const navigation = useNavigation();
  const { colors } = useColors();
  
  const {
    items,
    loading,
    serverId,
    showShare,
    setShowShare,
    email,
    setEmail,
    newItemText,
    setNewItemText,
    createItem,
    toggleCheck,
    updateText,
    updateItem,
    handleDelete,
    deleteEmptyItem,
    shareList
  } = useListDetailScreen(id, server_id);

  const newItemInputRef = useRef<TextInput>(null);
  const inputRefs = useRef<Record<number, TextInput | null>>({});
  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: name || 'Lista',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowShare(true)}
          disabled={!serverId}
          style={{ opacity: serverId ? 1 : 0.4 }}
        >
        <Text style={{ marginRight: 12, fontSize: 18 }}>
            📤
        </Text>
        </TouchableOpacity>
      )
    });
  }, [navigation, name, serverId]);

  const handleKeyPress = (e: any, itemId: number, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const prevItem = deleteEmptyItem(itemId);
      if (prevItem) {
        setTimeout(() => {
          inputRefs.current[prevItem.id]?.focus();
        }, 50);
      }
    }
  };

  const checkedCount = items.filter(i => i.checked).length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <SafeAreaView
        edges={['bottom']}
        style={[styles.container, { backgroundColor: colors.bg }]}
      >
        <View style={styles.statsBar}>
          <Text style={[styles.statsText, { color: colors.sub }]}>
            {checkedCount} de {items.length} {items.length === 1 ? 'item' : 'itens'}
          </Text>
        </View>
        <FlatList
          ref={flatListRef}
          contentContainerStyle={{
            paddingBottom: insets.bottom,
          }}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          data={items}
          keyExtractor={(item) => String(item.id)}
          style={[styles.list, { backgroundColor: colors.card }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: 56,
            offset: 56 * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <TodoItemRow
              item={item}
              index={index}
              isLast={index === items.length - 1}
              onToggleCheck={toggleCheck}
              onUpdateText={updateText}
              onBlur={updateItem}
              onDelete={handleDelete}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }}
              ref={(ref) => {
                inputRefs.current[item.id] = ref;
              }}
            />
          )}

          ListFooterComponent={
            <View
              style={[
                styles.addButton,
                { borderTopColor: colors.border },
              ]}
            >
              <Text style={[styles.addIcon, { color: colors.accent }]}>
                +
              </Text>

              <TextInput
                ref={newItemInputRef}
                value={newItemText}
                onChangeText={setNewItemText}
                onSubmitEditing={() => {
                  createItem();
                  requestAnimationFrame(() => {
                    newItemInputRef.current?.focus();
                  });
                }}
                placeholder="Novo item..."
                placeholderTextColor={colors.sub}
                returnKeyType="done"
                style={[
                  styles.input,
                  { color: colors.text }
                ]}
              />
            </View>
          }
        />
        
        <ShareModal
          visible={showShare}
          email={email}
          onEmailChange={setEmail}
          onClose={() => setShowShare(false)}
          onShare={shareList}
        />

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  addIcon: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '300',
    width: 22,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 0,
  },
});