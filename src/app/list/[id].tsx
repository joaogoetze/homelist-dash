import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme
} from 'react-native';
import { API_BASE } from '@/config/env';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

type ApiItem = {
  id: number;
  name: string;
  list_id: number;
  checked: boolean;
};

type Item = {
  localId: string;
  dbId?: number;
  text: string;
  checked: boolean;
  isNew: boolean;
};

export default function ListDetailScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [email, setEmail] = useState('');
  
  
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const authenticatedFetch = useAuthenticatedFetch();
  

const openShareModal = () => {
  setShowShare(true);
};

  // Mapa de refs para cada TextInput pelo id do item
  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const flatListRef = useRef<FlatList>(null);

  const colors = isDark
    ? { bg: '#0f0f0f', card: '#1c1c1e', text: '#f2f2f7', sub: '#8e8e93', border: '#2c2c2e', accent: '#34c759', check: '#34c759', strikethrough: '#636366' }
    : { bg: '#f2f2f7', card: '#ffffff', text: '#1c1c1e', sub: '#8e8e93', border: '#e5e5ea', accent: '#34c759', check: '#34c759', strikethrough: '#8e8e93' };

  // Define o título da tela com o nome da lista
  useLayoutEffect(() => {
    navigation.setOptions({ title: name || 'Lista',
      headerRight: () => (
      <TouchableOpacity onPress={openShareModal}>
        <Text style={{ marginRight: 12, fontSize: 18 }}>
          📤
        </Text>
      </TouchableOpacity>
    )
     });
  }, [navigation, name]);

  // Busca os itens da lista
  useEffect(() => {
    const fetchItems = async () => {
      try {

        const response = await authenticatedFetch(`${API_BASE}/lists/${id}/items`, {
          method: 'GET',
        });

        const data: ApiItem[] = await response.json();

        // Adapte o campo de texto conforme sua API (item.name, item.title, item.description...)
        const mapped: Item[] = data.map((item) => ({
          localId: `db-${item.id}`,
          dbId: item.id,
          text: item.name,
          checked: item.checked,
          isNew: false,
        }));

        setItems(mapped);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        // Inicia com um item vazio para poder digitar
        setItems([{ localId: `local-${Date.now()}`, text: '', checked: false, isNew: true }]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [id, authenticatedFetch]);

  // Garante que sempre haja pelo menos um item vazio para digitar
  useEffect(() => {
    if (!loading && items.length === 0) {
      setItems([{ localId: `local-${Date.now()}`, text: '', checked: false, isNew: true }]);
    }
  }, [loading, items.length]);

  const toggleCheck = (itemId: string) => {

    //função  de atualizar
    const item = items.find(i => i.localId === itemId);
  if (!item) return;

  if (item.dbId) {
  updateCheckItemToApi(item.dbId, !item.checked);
}
    setItems((prev) =>
      prev.map((i) => (i.localId === itemId ? { ...i, checked: !i.checked } : i))
    );
  };

  const updateText = (itemId: string, text: string) => {
    setItems((prev) =>
      prev.map((i) => (i.localId === itemId ? { ...i, text } : i))
    );
  };

  const saveItemToApi = async (item: Item) => {
  if (!item.text.trim()) return;

  const response = await authenticatedFetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listId: Number(id),
      name: item.text.trim(),
    }),
  });

  const created = await response.json();

  setItems(prev =>
    prev.map(i =>
      i.localId === item.localId
        ? { ...i, dbId: created.id, isNew: false }
        : i
    )
  );
};

const shareList = async () => {
  if (!email.trim()) return;

  try {
    await authenticatedFetch(`${API_BASE}/${Number(id)}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    // limpa e fecha
    setEmail('');
    setShowShare(false);

  } catch (error) {
    console.error("Erro ao compartilhar:", error);
  }
};

const updateItemToApi = (item: Item) => {
  if (!item.dbId) return;

  void authenticatedFetch(`${API_BASE}/items/${item.dbId}/name`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: item.text,
    }),
  }).catch((err) => console.error('Erro ao atualizar nome do item:', err));
};
const deleteItemFromApi = async (itemId: number) => {
  try {
    await authenticatedFetch(`${API_BASE}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao deletar:', error);
  }
};

const handleDelete = (item: Item) => {
  // Remove da UI primeiro (UX rápida)
  setItems(prev => prev.filter(i => i.localId !== item.localId));

  // Se já existe no banco, deleta lá também
  if (item.dbId) {
    deleteItemFromApi(item.dbId);
  }
};

    const updateCheckItemToApi = (itemId: number, checked: boolean) => {
    void authenticatedFetch(`${API_BASE}/items/${Number(itemId)}/check`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked }),
    }).catch((err) => console.error('Erro ao atualizar check do item:', err));
  };

  // Cria novo item abaixo do índice atual e foca nele — comportamento tipo Notes
  const addItemAfter = (index: number) => {

    const currentItem = items[index];
    
    if (currentItem.text.trim()) {

  if (currentItem.isNew) {
    saveItemToApi(currentItem);
  } else {
    updateItemToApi(currentItem);
  }

}
    const newItem: Item = {
  localId: `local-${Date.now()}`,
  text: '',
  checked: false,
  isNew: true,
};

    setItems((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newItem);
      return next;
    });

    // Aguarda o render do novo item antes de focar
    setTimeout(() => {
      inputRefs.current[newItem.localId]?.focus();
    }, 80);
  };

  // Ao pressionar Backspace em item vazio, remove e volta ao anterior
  const handleKeyPress = (e: any, itemId: string, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const currentItem = items.find((i) => i.localId === itemId);
      if (currentItem?.text === '' && items.length > 1) {
        setItems((prev) => prev.filter((i) => i.localId !== itemId));
        // Foca no item anterior
        const prevItem = items[index - 1];
        if (prevItem) {
          setTimeout(() => {
            inputRefs.current[prevItem.localId]?.focus();
          }, 50);
        }
      }
    }
  };

  const checkedCount = items.filter((i) => i.checked).length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Contador */}
      <View style={styles.statsBar}>
        <Text style={[styles.statsText, { color: colors.sub }]}>
          {checkedCount} de {items.length} {items.length === 1 ? 'item' : 'itens'}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => item.localId}
        style={[styles.list, { backgroundColor: colors.card }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.row,
              { borderBottomColor: colors.border },
              index === items.length - 1 && styles.rowLast,
            ]}
          >
            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => {
    console.log("pressionado");
    toggleCheck(item.localId);
  }}
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

            {/* Input */}
            <TextInput
              ref={(ref) => {
                inputRefs.current[item.localId] = ref;
              }}
              value={item.text}
              onChangeText={(text) => updateText(item.localId, text)}
              onSubmitEditing={() => addItemAfter(index)}
              onKeyPress={(e) => handleKeyPress(e, item.localId, index)}
              blurOnSubmit={false}          // não fecha o teclado
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
            {/* Botão de deletar */}
  <TouchableOpacity
    onPress={() => handleDelete(item)}
    style={styles.deleteButton}
  >
    <Text style={styles.deleteText}>🗑️</Text>
  </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          // Botão para adicionar item no final
          <TouchableOpacity
            style={[styles.addButton, { borderTopColor: colors.border }]}
            onPress={() => addItemAfter(items.length - 1)}
          >
            <Text style={[styles.addIcon, { color: colors.accent }]}>+</Text>
            <Text style={[styles.addText, { color: colors.sub }]}>Novo item</Text>
          </TouchableOpacity>
        )}
      />
{showShare && (
  <Modal visible={showShare} transparent animationType="fade" onRequestClose={() => setShowShare(false)}>
    <TouchableWithoutFeedback onPress={() => setShowShare(false)}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Compartilhar lista</Text>

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
                <Text style={{ color: colors.sub }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                onPress={shareList}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
)}
    </SafeAreaView>
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
    paddingVertical: 10,
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
},
});