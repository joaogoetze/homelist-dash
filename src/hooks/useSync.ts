import { useListDatabase } from '@/db/useListDatabase';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { API_BASE } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';
import { handleError } from '@/services/errorHandler';

export function useSync() {

    const authenticatedFetch = useAuthenticatedFetch();
    const listDatabase = useListDatabase();
    const { userId } = useAuth();

    async function syncLists() {
        console.log("Fazendo sync");
        
        await pushLocalChanges();
        await pullRemoteChanges();
    }

    async function pushLocalChanges() {
        if(!userId) {
            console.log("Sem user");      
            return;
        }

        // Pega os dados não sincados locais
        
        const unsynced = await listDatabase.getUnsyncData(userId);

        if (unsynced.length < 1) {
            console.log("Nada para sincronizar");
            return;
        }

        console.log("Itens não sincados:", unsynced);

        // Manda para API
        
        try {
            const changes = await authenticatedFetch(`${API_BASE}/lists/sync/push`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({unsynced}),
        });

        changes.forEach(element => {
            // console.log("element", element);
            //ver de criar um dto
            const data = { 
                id: element.local_id,
                name: element.name,
                sync_status: "synced",
                server_id: element.id
            }
            listDatabase.update(data);
        });
        } catch (error){
            handleError(error);
        }
        
        
        // Atualizar status no banco local


        // FAZER TRATANENTO COM ERROR HANDLER 

    }

    async function pullRemoteChanges() {
        // buscar da API
        // atualizar no banco local

        if(!userId) {
            console.log("Sem user");      
            return;
        }

        const datadosguri = await listDatabase.getLastSyncDate();
        //console.log("data dos gugu", datadosguri, "tipo: ", typeof(datadosguri));
        let a:any = datadosguri[0];
        //console.log("a", a.last_sync_at, "tipo:", typeof(a.last_sync_at));
        const biru = new Date(a.last_sync_at);
        console.log("biruuu", biru);
        
        
        
        

        // const date = new Date();
        // console.log("date", date, "tipo:", typeof(date));
        
        //biru.setMinutes(biru.getMinutes() - 5);
        biru.setHours(biru.getHours() - 3);
        //console.log("data formatada", date);
         

        try {
            
            const changes = await authenticatedFetch(`${API_BASE}/lists/sync/pull/${userId}/${biru}` , {
                method: 'GET',
            });

            // console.log("chahaha", changes);

            changes.forEach(element => {
                const data = {
                id: element.local_id,
                name: element.name,
                owner_ids: element.owner_ids,
                sync_status: "synced",
                server_id: element.id
                }
                listDatabase.upsert(data);
                listDatabase.updateSyncDate();
            })
            
        } catch (error) {
            console.log("Erro", error);
            
            handleError(error);
        }

    }

    return {
        syncLists,
    };


    
}