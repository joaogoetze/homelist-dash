import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useItemDatabase } from '@/db/useItemDatabase';
import { API_BASE } from '@/config/env';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { handleError } from '@/services/errorHandler';
import { ItemDatabase } from '@/types/types';

type Item = {
  id: number;
  serverId: number | null;
  text: string;
  checked: boolean;
};

export default function ListDetailScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverId, setServerId] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [email, setEmail] = useState('');
  const { id, name, server_id } = useLocalSearchParams<{ id: string; name: string, server_id: string }>();
  const navigation = useNavigation();
  const { colors } = useColors();
  const itemDb = useItemDatabase();
  const authenticatedFetch = useAuthenticatedFetch();

  const[newItemText, setNewItemText] = useState('');
  const newItemInputRef = useRef<TextInput>(null);

  const openShareModal = () => {
    setShowShare(true);
  };

  const inputRefs = useRef<Record<number, TextInput | null>>({});
  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    
    navigation.setOptions({ title: name || 'Lista',
      headerRight: () => (
        <TouchableOpacity
          onPress={openShareModal}
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

  useEffect(() => {
    const loadItems = async () => {
      try {
        const list = await itemDb.getById(Number(id));
        console.log("list", list);
        
        setServerId(list?.server_id ?? null);
        const data = await itemDb.show(Number(id));
        const mapped: Item[] = data.map((item: ItemDatabase) => ({
          id: item.id,
          serverId: item.server_id,
          text: item.name,
          checked: !!item.checked,
        }));
        setItems(mapped);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, [id]);


  const createItem = async () => {
    if (!newItemText.trim()) return;

    const created = await itemDb.create({
        name: newItemText.trim(),
        list_id: Number(id),
        sync_status: "created",
    });

    setItems(prev => [
        ...prev,
        {
            id: created.id,
            serverId: null,
            text: created.name,
            checked: false,
        },
    ]);

    setNewItemText("");

    requestAnimationFrame(() => {
        newItemInputRef.current?.focus();
    });
};

  const toggleCheck = async (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, checked: !i.checked } : i))
    );

    await itemDb.update({
      id: itemId, 
      checked: !item.checked,
      sync_status: "updated"
    });
  };

  const updateText = (itemId: number, text: string) => {
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, text } : i))
    );
  };

  const shareList = async () => {
    if (!email.trim()) return;

    try {
      await authenticatedFetch(`${API_BASE}/lists/${Number(server_id)}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setEmail('');
      setShowShare(false);

    } catch (error) {
      
      handleError(error);
    }
  };

  const updateItem = async (item: Item) => {
    if (!item.text.trim()) return;

    await itemDb.update({
      id: item.id,
      name: item.text,
  });
  };

  const handleDelete = async (item: Item) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    await itemDb.remove(item.id);
  };

  const handleKeyPress = (e: any, itemId: number, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const currentItem = items.find(i => i.id === itemId);
      if (currentItem?.text === '' && items.length > 1) {
        setItems(prev => prev.filter(i => i.id !== itemId));
        const prevItem = items[index - 1];
        if (prevItem) {
          setTimeout(() => {
            inputRefs.current[prevItem.id]?.focus();
          }, 50);
        }
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
            <View
              style={[
                styles.row,
                { borderBottomColor: colors.border },
                index === items.length - 1 && styles.rowLast,
              ]}
            >
              <TouchableOpacity
                onPress={() => toggleCheck(item.id)}
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
                ref={(ref) => {
                  inputRefs.current[item.id] = ref;
                }}
                onFocus={() => {
                  flatListRef.current?.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0.5,
                  });
                }}
                onBlur={() => updateItem(item)}
                value={item.text}
                onChangeText={(text) => updateText(item.id, text)}
                //onSubmitEditing={() => addItemAfter(index)}
                onKeyPress={(e) => handleKeyPress(e, item.id, index)}
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
                onPress={() => handleDelete(item)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
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
      onSubmitEditing={createItem}
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
        
        {showShare && (
          <Modal 
            visible={showShare} 
            transparent 
            animationType="fade" 
            onRequestClose={() => setShowShare(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowShare(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      Compartilhar lista
                      </Text>
                    <TextInput
                      placeholder="Email do usuário"
                      value={email}
                      onChangeText={setEmail}
                      style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
                      placeholderTextColor={colors.sub}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalBtn, { borderColor: colors.border }]}
                        onPress={() => setShowShare(false)}
                      >
                        <Text style={{ color: colors.sub }}>
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                        onPress={shareList}
                      >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>
                          Compartilhar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
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
  addText: {
    fontSize: 17,
  },
  clearButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  clearText: {
    fontSize: 14,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 6,
  },
  deleteText: {
    fontSize: 16,
  }
});