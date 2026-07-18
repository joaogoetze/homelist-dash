import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useListDatabase } from '@/db/useListDatabase';
import { handleError } from '@/services/errorHandler';
import { ListDatabase } from '@/types/types';
import { ListActionModalMode } from '@/components/modals/ListActionModal';

type ModalState = { mode: ListActionModalMode; target?: ListDatabase };

export function useListsScreen() {
  const [lists, setLists] = useState<ListDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  const { accessToken, userId } = useAuth();
  const listDatabase = useListDatabase();

  const fetchLists = async () => {
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
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchLists();
  }, [accessToken, userId]);

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

  const openCreate = () => {
    setInputValue('');
    setModal({ mode: 'create' });
    setOpenMenuId(null);
  };

  const closeMenu = () => setOpenMenuId(null);
  const toggleMenu = (id: number) => setOpenMenuId(openMenuId === id ? null : id);

  const closeModal = () => {
    setModal(null);
    setInputValue('');
  };

  const handleDelete = async () => {
    if (!modal || modal.mode !== 'delete' || !modal.target) return;
    try {
      await listDatabase.remove(modal.target.id);
      fetchLists();
    } catch (error) {
      handleError(error);
    }
    setModal(null);
  };

  const handleSubmit = async () => {
    if (!modal || !inputValue.trim() || !userId) return;
    try {
      if (modal.mode === 'create') {
        await listDatabase.create({
          name: inputValue.trim(),
          sync_status: 'created',
          owner_id: userId
        });
        fetchLists();
      } else if (modal.mode === 'rename' && modal.target) {
        await listDatabase.update({
          id: modal.target.id,
          name: inputValue.trim(),
          sync_status: 'updated'
        });
        fetchLists();
      }
      setModal(null);
      setInputValue('');
    } catch(error) {
      handleError(error)
    }
  };

  return {
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
  };
}
