import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import * as Network from 'expo-network';
import { useEffect, useRef } from 'react';

export function SyncProvider({ children }: { children: React.ReactNode }) {

    const { syncLists } = useSync();
    const { userId, loading } = useAuth();

    const syncListsRef = useRef(syncLists);

    useEffect(() => {
        syncListsRef.current = syncLists;
    }, [syncLists]);

    useEffect(() => {
        if (loading || !userId) return;

        let interval: NodeJS.Timeout | null = null;
        let isCurrentlyConnected = false;

        const startSyncing = async () => {
            if (interval) return;

            try {
                await syncListsRef.current();
            } catch (err) {
                console.log('Erro ao iniciar sincronização', err);
            }

            interval = setInterval(async () => {
                console.log("Rede disponível, sincronizando...");
                try {
                    await syncListsRef.current();
                } catch (err) {
                    console.log('Erro na sincronização', err);
                }
            }, 30_000);
        };

        const stopSyncing = () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
                console.log("Rede indisponível, parando de sincronizar");
            }
        };

        const handleNetworkChange = (state: Network.NetworkState) => {

            console.log("Evento de rede:", {
                isConnected: state.isConnected,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
            });

            if (state.isConnected && state.isInternetReachable !== false) {
                if (!isCurrentlyConnected) {
                    isCurrentlyConnected = true;
                    startSyncing();
                }
            } else {
                if (isCurrentlyConnected) {
                    isCurrentlyConnected = false;
                    stopSyncing();
                }
            }
        };

        // Verifica estado inicial logo ao abrir/logar
        Network.getNetworkStateAsync().then(state => {
            console.log("Verificando rede ao logar");
            
            if (state.isConnected && state.isInternetReachable !== false) {
                console.log("Rede disponível");
                
                isCurrentlyConnected = true;
                startSyncing();
            }
        });

        // Monitora as mudanças de rede por eventos
        const subscription = Network.addNetworkStateListener(handleNetworkChange);

        return () => {
            subscription.remove();
            stopSyncing();
        };

    }, [userId, loading]);

    return children;
}