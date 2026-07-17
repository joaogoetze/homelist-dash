import { useListDatabase } from '@/db/useListDatabase';
import { useItemDatabase } from '@/db/useItemDatabase';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { API_BASE } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';
import { handleError } from '@/services/errorHandler';

export function useSync() {

    const authenticatedFetch = useAuthenticatedFetch();
    const listDatabase = useListDatabase();
    const itemDatabase = useItemDatabase();
    const { userId } = useAuth();

    async function syncLists() {
        await pushLocalChanges();
        await pullRemoteChanges();
        await pushItemChanges();
        await pullItemRemoteChanges();
    }

    async function pushItemChanges() {
        if(!userId) {   
            return;
        }

        const unsyncedItems = await itemDatabase.getUnsyncData(userId);
        
        if (unsyncedItems.length < 1) {
            return;
        }

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

    async function pushLocalChanges() {
        
        if(!userId) {   
            return;
        }
        
        const unsynced = await listDatabase.getUnsyncData(userId);

        if (unsynced.length < 1) {
            return;
        }

        try {
            const changes = await authenticatedFetch(`${API_BASE}/lists/sync/push`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({unsynced}),
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

    async function pullItemRemoteChanges() {
        
        if(!userId) {
            return;
        }

        const datadosguri = await itemDatabase.getLastSyncDate();
        
        let a:any = datadosguri[0];
        const biru = new Date(a.last_sync_at);
        
        biru.setHours(biru.getHours());
        
        try {
            
            const changes = await authenticatedFetch(`${API_BASE}/items/sync/pull/${userId}/${biru}` , {
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
            console.error("Erro", error);
            handleError(error);
        }
    }

    async function pullRemoteChanges() {
        
        if(!userId) {
            return;
        }

        const datadosguri = await listDatabase.getLastSyncDate();
        let a:any = datadosguri[0];
        const biru = new Date(a.last_sync_at);
    
        biru.setHours(biru.getHours());

        try {
            
            const changes = await authenticatedFetch(`${API_BASE}/lists/sync/pull/${userId}/${biru}` , {
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
            console.error("Erro", error);
            handleError(error);
        }
    }

    return {
        syncLists,
    };   
}