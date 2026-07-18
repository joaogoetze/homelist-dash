import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useListsScreen } from '@/hooks/useListsScreen';
import { ListCard } from '@/components/lists/ListCard';
import { ListActionModal } from '@/components/modals/ListActionModal';

export default function ListsScreen() {
  const router = useRouter();
  const { colors } = useColors();
  const {
    lists,
    loading,
    refreshing,
    onRefresh,
    openMenuId,
    toggleMenu,
    closeMenu,
    modal,
    openCreate,
    openRename,
    openDelete,
    closeModal,
    inputValue,
    setInputValue,
    handleSubmit,
    handleDelete
  } = useListsScreen();

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
          <ListCard
            item={item}
            onPress={() => {
              closeMenu();
              router.push({ pathname: '/list/[id]', params: { id: item.id, name: item.name, server_id: item.server_id } });
            }}
            onMenuToggle={() => toggleMenu(item.id)}
            isMenuOpen={openMenuId === item.id}
            onRename={() => openRename(item)}
            onDelete={() => openDelete(item)}
          />
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
        onPress={openCreate}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      <ListActionModal
        visible={!!modal}
        mode={modal?.mode || null}
        targetName={modal?.target?.name}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
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
});