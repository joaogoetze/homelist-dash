import { API_BASE } from '@/config/env';
import { useListDatabase } from '@/db/useListDatabase';
import { useItemDatabase } from '@/db/useItemDatabase';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useAuth } from '@/hooks/useAuth';
import { handleError } from '@/services/errorHandler';

export function useSync() {

    const authenticatedFetch = useAuthenticatedFetch();
    const listDatabase = useListDatabase();
    const itemDatabase = useItemDatabase();
    const { userId } = useAuth();

    async function syncLists() {
        await pushListsLocalChanges();
        await pullListsRemoteChanges();
        await pushItemChanges();
        await pullItemRemoteChanges();
    }

    async function pushListsLocalChanges() {
        
        if(!userId) return;
        
        const unsyncedLists = await listDatabase.getUnsyncData(userId);

        if (unsyncedLists.length < 1) return;

        try {
            const changes = await authenticatedFetch(`${API_BASE}/lists/sync/push`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unsyncedLists }),
            });

            for (const element of changes) {                        
            
                const data = { 
                    id: element.local_id,
                    name: element.name,
                    sync_status: "synced",
                    server_id: element.id
                }
                await listDatabase.update(data);
            }
        } catch (error){
            handleError(error);
        }
    }

    async function pullListsRemoteChanges() {
        
        if(!userId) return;

        const lastSyncDate = await listDatabase.getLastSyncDate();
        const date = new Date(lastSyncDate[0]);

        try {
            const changes = await authenticatedFetch(`${API_BASE}/lists/sync/pull/${date}` , {
                method: 'GET',
            });

            for (const element of changes) {
                const data = {
                    id: element.local_id,
                    name: element.name,
                    owner_ids: element.owner_ids,
                    sync_status: "synced",
                    server_id: element.id
                }
                await listDatabase.upsert(data);
            }
            await listDatabase.updateSyncDate();
            
        } catch (error) {
            handleError(error);
        }
    }

    async function pushItemChanges() {
        
        if (!userId) return;

        const unsyncedItems = await itemDatabase.getUnsyncData(userId);
        
        if (unsyncedItems.length < 1) return;

        try {
            const changes = await authenticatedFetch(`${API_BASE}/items/sync/push`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unsyncedItems })
            });
        
            for (const element of changes) {
                const listId = await itemDatabase.getLocalListId(element.list_id);
                const data = { 
                    id: element.local_id,
                    name: element.name,
                    checked: element.checked,
                    list_id: listId,
                    sync_status: "synced",
                    server_id: element.id
                }
                await itemDatabase.update(data);
            }
            
        } catch (error){
            handleError(error);
        }
    }

    async function pullItemRemoteChanges() {
        if(!userId) return;

        const lastSyncDate = await itemDatabase.getLastSyncDate();
        const date = new Date(lastSyncDate[0]);
        
        try {
            const changes = await authenticatedFetch(`${API_BASE}/items/sync/pull/${date}` , {
                method: 'GET',
            });

            for (const element of changes) {
                const listId = await itemDatabase.getLocalListId(element.list_id);
                const data = {
                    id: element.local_id,
                    name: element.name,
                    checked: element.checked,
                    sync_status: "synced",
                    server_id: element.id,
                    list_id: listId
                }
                await itemDatabase.upsert(data);
            }
            await listDatabase.updateSyncDate();
            
        } catch (error) {
            handleError(error);
        }
    }

    return { syncLists };   
}