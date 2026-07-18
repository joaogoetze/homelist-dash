import { useSQLiteContext } from "expo-sqlite";
import { ListDatabase } from "@/types/types";
import { buildUpdateQuery } from "@/utils/utils";

export function useListDatabase() {
    const database = useSQLiteContext();

    async function show(ownerId: number) {
        try {
            const query = `
            SELECT * 
            FROM lists 
            WHERE EXISTS (
                SELECT 1 
                FROM json_each(owner_ids) 
                WHERE value = ?
                )  
            AND deleted_at IS NULL`;
            
            const response = await database.getAllAsync<ListDatabase>(query, [ownerId]);
            
            return response;
        } catch (error) {
            throw error;
        }
    }

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

    async function getLocalListId(serverId: number) {    
        const result = await database.getAllAsync<{ id: number }>(`
            SELECT id
            FROM lists
            WHERE server_id = ?
            `, serverId
        );
            
        return result[0].id;
    }

    async function getById(id: number) {
        return await database.getFirstAsync<{ id: number; server_id: number | null; name: string; }>(
            "SELECT id, server_id, name FROM lists WHERE id = ?",
            [id]
        );
    }

    async function getUnsyncData(ownerId: number) {
        try {
            const query = `
            SELECT * 
            FROM lists 
            WHERE EXISTS (
                SELECT 1 
                FROM json_each(owner_ids) 
                WHERE value = ?
                )  
            AND sync_status <> 'synced'`;
            
            const response = await database.getAllAsync<ListDatabase>(query, [ownerId]);
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    return { 
        show,
        create,
        update,
        upsert,
        remove,
        getById,
        getLocalListId,
        getUnsyncData, 
    }
}