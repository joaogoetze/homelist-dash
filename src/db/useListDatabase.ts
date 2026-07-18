import { useSQLiteContext } from "expo-sqlite";
import { ListDatabase } from "@/types/types";
import { buildUpdateQuery } from "@/utils/utils";

export function useListDatabase() {
    const database = useSQLiteContext()

    async function create(data: Omit<ListDatabase, "id">) {
        const result = await database.runAsync(`
            INSERT INTO lists 
            (name, owner_ids, sync_status) 
            VALUES (?, ?, "created")
            `, data.name, JSON.stringify(data.owner_id)
        );

        return {
            id: Number(result.lastInsertRowId),
            name: data.name,
        };
    }

    async function updateSyncDate() {
        const now = new Date().toISOString();
        
        await database.runAsync(`
            INSERT INTO sync_metadata 
            (id, last_sync_at) 
            VALUES (1, ?) 
            ON CONFLICT (id) DO 
            UPDATE SET last_sync_at = excluded.last_sync_at
            `, now
        );
    }

    async function upsert(data: any) {
        const result = await database.runAsync(`
            INSERT INTO lists 
            (server_id, name, owner_ids, sync_status) 
            VALUES (?, ?, ?, ?) 
            ON CONFLICT (server_id) DO 
            UPDATE SET name = excluded.name, owner_ids = excluded.owner_ids, sync_status = "synced"
            `, data.server_id, data.name, JSON.stringify(data.owner_ids), data.sync_status
        );

        return {
            id: Number(result.lastInsertRowId),
            name: data.name,
        }
    }

    async function update(data: Omit<ListDatabase, "owner_id">) {
        const { sql, params } = buildUpdateQuery("lists", data.id, {
            server_id: data.server_id,
            name: data.name,
            sync_status: data.sync_status
        });

        const statement = await database.prepareAsync(sql);

        try {
            await statement.executeAsync(params);
        } catch (error) {
            throw error
        } finally {
            await statement.finalizeAsync()
        }
    }

    async function remove(id: number) {
        const statement = await database.prepareAsync(`
            UPDATE lists 
            SET deleted_at = CURRENT_TIMESTAMP, sync_status = "deleted" 
            WHERE id = $id`
        );

        try {
            await statement.executeAsync({ $id: id });
        } catch (error) {
            throw error
        } finally {
            await statement.finalizeAsync()
        }
    }

    async function show(ownerId: number) {
        try {
            const query = `
            SELECT * 
            FROM lists 
            WHERE EXISTS (
                SELECT 1 
                FROM json_each(owner_ids) 
                WHERE value = ${ownerId}
                )  
            AND deleted_at IS NULL`;
            
            const response = await database.getAllAsync<ListDatabase>(query);
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    async function getUnsyncData(ownerId: number) {
        try {
            const query = `
            SELECT * 
            FROM lists 
            WHERE EXISTS (
                SELECT 1 
                FROM json_each(owner_ids) 
                WHERE value = ${ownerId}
                )  
            AND sync_status <> 'synced'`;
            
            const response = await database.getAllAsync<ListDatabase>(query);
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    async function getLastSyncDate(): Promise<string> {
        try {
            const date = await database.getAllAsync<{ last_sync_at: string }>("SELECT last_sync_at FROM sync_metadata WHERE id = 1");
            
            return date[0].last_sync_at;
        } catch(error) {
            throw error;
        }
    }

    return { 
        create,
        update,
        remove,
        show,
        getUnsyncData,
        upsert,
        updateSyncDate,
        getLastSyncDate 
    }
}