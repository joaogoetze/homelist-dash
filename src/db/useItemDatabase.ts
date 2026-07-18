import { useSQLiteContext } from "expo-sqlite";
import { ItemDatabase } from "@/types/types";
import { buildUpdateQuery } from "@/utils/utils";

export function useItemDatabase() {
    const database = useSQLiteContext();

    async function show(listId: number) {
        const response = await database.getAllAsync<ItemDatabase>(
            `SELECT * FROM items WHERE list_id = ? AND deleted_at IS NULL`,
            listId
        );
        
        return response;
    }

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

    async function upsert(data: ItemDatabase) {  
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

    return { 
        show,
        create, 
        update, 
        upsert,
        remove, 
        getUnsyncData,
    }
}