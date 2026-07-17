import { useSQLiteContext } from "expo-sqlite";
import { ItemDatabase } from "@/types/types";

export function useItemDatabase() {
    const database = useSQLiteContext()

    async function create(data: Omit<ItemDatabase, "id" | "server_id" | "checked"> & { checked?: boolean }) {
        const result = await database.runAsync(
            'INSERT INTO items (name, list_id, checked, sync_status) VALUES (?, ?, ?, "created")',
            data.name,
            data.list_id,
            data.checked ? 1 : 0
        );

        return {
            id: Number(result.lastInsertRowId),
            name: data.name,
        };
    }

    async function show(listId: number) {
        const response = await database.getAllAsync<ItemDatabase>(
            `SELECT * FROM items WHERE list_id = ? AND deleted_at IS NULL`,
            listId
        );
        
        return response;
    }

    async function update(data: any) {
        const { sql, params } = buildUpdateQuery("items", data.id, data);
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
        const statement = await database.prepareAsync(
            'UPDATE items SET deleted_at = CURRENT_TIMESTAMP, sync_status = "deleted" WHERE id = $id'
        )

        try {
            await statement.executeAsync({ $id: id })
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
            `, serverId);
            console.log("result", result[0].id);
            
            return result[0].id;
    }

    async function upsert(data: ItemDatabase) {
        console.log("data", data);
        
        const result = await database.runAsync(
            `INSERT INTO items (server_id, list_id, name, checked, sync_status)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT (server_id) DO UPDATE SET
               name = excluded.name,
               checked = excluded.checked,
               sync_status = "synced"`,
            data.server_id,
            data.list_id,
            data.name,
            data.checked ? 1 : 0,
            data.sync_status || "synced"
        )
        

        return {
            id: Number(result.lastInsertRowId),
            name: data.name,
        }
    }

    async function getById(id: number) {
        console.log("id", id);
        
    return await database.getFirstAsync<{
        id: number;
        server_id: number | null;
        name: string;
    }>(
        "SELECT id, server_id, name FROM lists WHERE id = ?",
        [id]
    );
}

    async function updateSyncDate() {

        const now = new Date().toISOString();
        await database.runAsync(
            `INSERT INTO sync_metadata (id, last_sync_at) 
            VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET last_sync_at = excluded.last_sync_at`,
            now
        );
    }

    async function getUnsyncData(userId: number) {
        
        const response = await database.getAllAsync<ItemDatabase>(
            `SELECT
                i.id,
                i.name,
                i.checked,
                i.server_id,
                l.server_id as list_id,
                i.sync_status
            FROM items i 
            join lists l on l.id = i.list_id
            WHERE EXISTS (
                SELECT 1 
                FROM json_each(l.owner_ids) 
                WHERE value = ?
            )  AND i.sync_status <> 'synced' AND l.deleted_at IS NULL`,
            userId
        );
        return response;
    }

    async function getLastSyncDate() {
        const date = await database.getAllAsync<{ last_sync_at: string }>(
            "SELECT last_sync_at FROM sync_metadata WHERE id = 1"
        );
        return date;
    }

    function buildUpdateQuery(
        table: string,
        id: number,
        data: Record<string, any>
    ) {
        const fields = [];
        const params: Record<string, any> = { $id: id };

        for (const [key, value] of Object.entries(data)) {
            
            if (value !== undefined) {
                params[`$${key}`] = value;
                fields.push(`${key} = $${key}`)
            }
        }

        return {
            sql: `UPDATE ${table} SET ${fields.join(", ")} WHERE id = $id`,
            params,
        };
    }

    return { create, show, update, remove, upsert, getUnsyncData, getLastSyncDate, updateSyncDate, getLocalListId, getById }
}