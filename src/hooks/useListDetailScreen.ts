import { useState, useEffect } from 'react';
import { useItemDatabase } from '@/db/useItemDatabase';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { handleError } from '@/services/errorHandler';
import { ItemDatabase } from '@/types/types';
import { API_BASE } from '@/config/env';
import { Item } from '@/components/items/TodoItemRow';

export function useListDetailScreen(id: string, serverIdParam?: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverId, setServerId] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [email, setEmail] = useState('');
  const [newItemText, setNewItemText] = useState('');
  
  const itemDb = useItemDatabase();
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const listId = Number(id);
        const list = await itemDb.getById(listId);
        
        setServerId(list?.server_id ?? null);
        const data = await itemDb.show(listId);
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
    if (id) loadItems();
  }, [id]);

  const createItem = async () => {
    if (!newItemText.trim()) return;

    try {
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
    } catch(error) {
      handleError(error);
    }
  };

  const toggleCheck = async (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, checked: !i.checked } : i))
    );

    try {
      await itemDb.update({
        id: itemId, 
        checked: !item.checked,
        sync_status: "updated"
      });
    } catch(error) {
      handleError(error);
    }
  };

  const updateText = (itemId: number, text: string) => {
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, text } : i))
    );
  };

  const updateItem = async (item: Item) => {
    if (!item.text.trim()) return;
    try {
      await itemDb.update({
        id: item.id,
        name: item.text,
      });
    } catch(error) {
      handleError(error);
    }
  };

  const handleDelete = async (item: Item) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    try {
      await itemDb.remove(item.id);
    } catch(error) {
      handleError(error);
    }
  };
  
  const deleteEmptyItem = (itemId: number) => {
    const currentItem = items.find(i => i.id === itemId);
    if (currentItem?.text === '' && items.length > 1) {
      const index = items.findIndex(i => i.id === itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      itemDb.remove(itemId).catch(handleError);
      return items[index - 1]; // Return previous item to focus
    }
    return undefined;
  };

  const shareList = async () => {
    if (!email.trim() || !serverIdParam) return;

    try {
      await authenticatedFetch(`${API_BASE}/lists/${Number(serverIdParam)}/users`, {
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

  return {
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
  };
}
