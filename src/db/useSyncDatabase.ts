import { useSQLiteContext } from "expo-sqlite";

export function useSyncDatabase() {
    const database = useSQLiteContext();

    async function getLastSyncDate(): Promise<Date> {
        const result = await database.getAllAsync<{ last_sync_at: string }>(
            "SELECT last_sync_at FROM sync_metadata WHERE id = 1"
        );

        if (result.length === 0 || !result[0].last_sync_at) {
            return new Date("1970-01-01T00:00:00.000Z");
        }

        return new Date(result[0].last_sync_at);
    }
    
    async function updateSyncDate() {
        const now = new Date().toISOString();
        
        await database.runAsync(
            `INSERT INTO sync_metadata (id, last_sync_at) 
            VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET last_sync_at = excluded.last_sync_at`,
            now
        );
    }

    return {          
        getLastSyncDate, 
        updateSyncDate,
    }
}