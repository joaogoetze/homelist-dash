import { useEffect } from 'react';
import * as Network from 'expo-network';
import { useSync } from '@/hooks/useSync';
import { useAuth } from '@/hooks/useAuth';

export function SyncProvider({ children } : { children: React.ReactNode}) {

    // Ver se vale a pena adicionar um listener, ser mais dinâmica a sincronização quando usuário conectar na rede
    
    const { syncLists } = useSync();
    const { userId, loading } = useAuth();

    useEffect(()  => {

        //console.log("Provider de rede ativo");

        if (loading) return;

        if (!userId) return;
        

        let interval: NodeJS.Timeout | null = null;

        async function startSyncTimer() {
            
            const networkState = await Network.getNetworkStateAsync();

            if (!networkState.isConnected) {
                console.log("Não tem net");
                return;
            }

            await syncLists();

            interval = setInterval(async () => {
                
                const state = await Network.getNetworkStateAsync();

                if (state.isConnected) {
                    //console.log("tem rede");
                    
                    await syncLists();
                } else {
                    console.log("Not rede pae");
                }
                
                

            }, 10_000)
        }

        startSyncTimer();

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };


    }, [userId, loading]);
    
    return children; 
}