  import { useRouter } from 'expo-router';
  import { use, useEffect, useState } from 'react';
  import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
  } from 'react-native';
  import { useColors } from '@/hooks/useColors';
  import { useAuth } from '@/hooks/useAuth';
  import { handleError } from '@/services/errorHandler';

  import { 
    useListDatabase,
  } from '@/db/useListDatabase';

  import { ListDatabase } from '@/types/types';

  type ModalState = {mode: 'create' } | { mode: 'rename'; target: ListDatabase} | { mode: 'delete'; target: ListDatabase};

  export default function ListsScreen() {
    
    const [lists, setLists] = useState<ListDatabase[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();
    const { colors } = useColors();
    const { accessToken, userId } = useAuth();
    const listDatabase = useListDatabase();

    // chama as listas do banco local e altera a o estados das listas no front
    async function fetchLists() {
      if(!userId) return;
      try {
        
        const data = await listDatabase.show(userId);
        setLists(data);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }

    // atualiza a lista no banco local
    async function update (id: number, name: string, sync_status: string) {
      try {
        await listDatabase.update({
          id,
          name,
          sync_status
        });
      } catch (error) {
        console.log("Erro", error);
        handleError(error);
      }
    }

    // cria a lista no banco local
    async function create (name: string, sync_status: string) {
      if (!userId) return;
      const owner_id = userId;
      try {
        const list = await listDatabase.create({
          name,
          sync_status,
          owner_id
        });
        return list;
      } catch (error) {
        console.log("Erro", error);
        handleError(error);
      }
    }

    // remove a lista do  banco local (coloca deleted_at)
    async function remove(id: number) {
      try {
        await listDatabase.remove(id)
      } catch (error) {
        console.log("Erro", error);
        handleError(error);
      }
    }

    // faz o fetch das listas toda vez que a tela renderiza
    useEffect(() => {
      if (!accessToken) return;
      fetchLists();
    }, [accessToken]);

    const onRefresh = () => { 
      setRefreshing(true); 
      fetchLists(); 
    };

    const openDelete = (item: ListDatabase) => {
      setModal({ mode: 'delete', target: item });
      setOpenMenuId(null);
    };

    const openRename = (item: ListDatabase) => {
      setInputValue(item.name);
      setModal({ mode: 'rename', target: item });
      setOpenMenuId(null);
    };

    const handleDelete = async () => {
      if (!modal || modal.mode !== 'delete') return;
      try {
        await remove(modal.target.id);
        fetchLists()
      } catch (error) {
        handleError(error);
      }
      setModal(null);
    };

    const handleSubmit = async () => {
      if (!modal || !inputValue.trim()) return;
      try {
        if (modal.mode === 'create') {
          await create(inputValue.trim(), "created")
          fetchLists();
        } else {
          console.log("Modal target", modal.target); 
          await update(modal.target.id, inputValue.trim(), "updated");
          fetchLists();
        }
        setModal(null);
        setInputValue('');
      } catch(error) {
        handleError(error)
      }
    };

    if (loading) {
      return (
        <SafeAreaView style={[styles.centered, { backgroundColor: colors.bg }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => {
                  setOpenMenuId(null);
                  router.push({ pathname: '/list/[id]', params: { id: item.id, name: item.name, server_id: item.server_id } });
                }}
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
                onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.menuDots, { color: colors.sub }]}>•••</Text>
              </TouchableOpacity>

              {openMenuId === item.id && (
                <View style={[styles.actionSheet, { backgroundColor: colors.sheet, borderColor: colors.border }]}>
                  <TouchableOpacity style={styles.actionRow} onPress={() => openRename(item)}>
                    <Text style={[styles.actionText, { color: colors.text }]}>✏️  Renomear</Text>
                  </TouchableOpacity>
                  <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
                  <TouchableOpacity style={styles.actionRow} onPress={() => openDelete(item)}>
                    <Text style={[styles.actionText, { color: colors.danger }]}>🗑️  Deletar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛍️</Text>
              <Text style={[styles.emptyText, { color: colors.sub }]}>Nenhuma lista encontrada</Text>
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.accent }]}
          onPress={() => setModal({ mode: 'create' })}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>＋</Text>
        </TouchableOpacity>

        <Modal visible={!!modal} transparent animationType="fade" onRequestClose={() => setModal(null)}>
          <TouchableWithoutFeedback onPress={() => setModal(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                  {modal?.mode === 'delete' ? (
                    <>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>
                        Tem certeza que deseja excluir a lista "{modal.target.name}"?
                      </Text>
                      <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalBtn, { borderColor: colors.border }]} onPress={() => setModal(null)}>
                          <Text style={{ color: colors.sub }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.danger, borderColor: colors.danger }]} onPress={handleDelete}>
                          <Text style={{ color: '#fff', fontWeight: '600' }}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>
                        {modal?.mode === 'create' ? 'Nova lista' : 'Renomear lista'}
                      </Text>
                      <TextInput
                        style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
                        placeholder={modal?.mode === 'create' ? 'Nome da lista' : modal?.target.name}
                        placeholderTextColor={colors.sub}
                        value={inputValue}
                        onChangeText={setInputValue}
                        autoFocus
                        onSubmitEditing={handleSubmit}
                        returnKeyType="done"
                      />
                      <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalBtn, { borderColor: colors.border }]} onPress={() => setModal(null)}>
                          <Text style={{ color: colors.sub }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]} onPress={handleSubmit}>
                          <Text style={{ color: '#fff', fontWeight: '600' }}>Criar</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: { 
      flex: 1 
    },
    centered: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    listContent: { 
      padding: 16
    },
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
    empty: { 
      alignItems: 'center', 
      paddingTop: 80, 
      gap: 12 
    },
    emptyEmoji: { 
      fontSize: 48 
    },
    emptyText: { 
      fontSize: 16 
    },
    fab: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      width: 50,
      height: 50,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { 
        width: 0, 
        height: 2 
      },
      shadowRadius: 4,
    },
    fabIcon: { 
      color: '#fff', 
      fontSize: 28, 
      fontWeight: '600' 
    },
    modalOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.4)', 
      justifyContent: 'center', 
      padding: 32 
    },
    modalCard: { 
      borderRadius: 16, 
      padding: 20, 
      gap: 16 
    },
    modalTitle: { 
      fontSize: 17, 
      fontWeight: '600' 
    },
    modalInput: { 
      borderWidth: 0.5, 
      borderRadius: 10, 
      paddingHorizontal: 12, 
      paddingVertical: 10, 
      fontSize: 16
    },
    modalActions: { 
      flexDirection: 'row', 
      gap: 10 
    },
    modalBtn: { 
      flex: 1, 
      borderWidth: 0.5, 
      borderRadius: 10, 
      paddingVertical: 11, 
      alignItems: 'center' 
    },
  });