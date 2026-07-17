import { useSQLiteContext } from "expo-sqlite";
import { ListDatabase } from "@/types/types";

export function useListDatabase() {
    const database = useSQLiteContext()

    async function create(data: Omit<ListDatabase, "id">) {
        const result = await database.runAsync(
            'INSERT INTO lists (name, owner_ids, sync_status) VALUES (?, ?, "created")',
            data.name,
            JSON.stringify(data.owner_id)
        );

        return {
            id: Number(result.lastInsertRowId),
            name: data.name,
        };
    }

    async function updateSyncDate() {
        const now = new Date().toISOString();
        //console.log("Update da sync");
        
        const result = await database.runAsync(
            'INSERT INTO sync_metadata (id, last_sync_at) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET last_sync_at = excluded.last_sync_at',
            now
        );
        
        
    }

    async function upsert(data: any) {
        //console.log("data", data);
        
        const result = await database.runAsync(
            `INSERT INTO lists 
            (server_id, name, owner_ids, sync_status) 
            VALUES (?, ?, ?, ?) 
            ON CONFLICT (server_id) 
            DO UPDATE SET name = excluded.name, owner_ids = excluded.owner_ids, sync_status = "synced"`     ,
            data.server_id,
            data.name,
            JSON.stringify(data.owner_ids),
            data.sync_status
        )

        //console.log("result", result);
        

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
        const statement = await database.prepareAsync(
            'UPDATE lists SET deleted_at = CURRENT_TIMESTAMP, sync_status = "deleted" WHERE id = $id'
        )

        try {
            await statement.executeAsync({
                $id: id,
            })
        } catch (error) {
            throw error
        } finally {
            await statement.finalizeAsync()
        }
    }

    async function show(ownerId: number) {
        try {
            
            
            const query = `SELECT * FROM lists WHERE EXISTS (SELECT 1 FROM json_each(owner_ids) WHERE value = ${ownerId})  AND deleted_at IS NULL`;
            
            const response = await database.getAllAsync<ListDatabase>(query);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async function getUnsyncData(ownerId: number) {
        try {
            const query = `SELECT * FROM lists WHERE EXISTS (SELECT 1 FROM json_each(owner_ids) WHERE value = ${ownerId})  AND sync_status <> 'synced'`;
            const response = await database.getAllAsync<ListDatabase>(query);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async function getLastSyncDate() {
        try {
            const date = await database.getAllAsync("SELECT last_sync_at FROM sync_metadata WHERE id = 1");
            
            return date;
        } catch(error) {
            throw error;
        }
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

    return { create, update, remove, show, getUnsyncData, upsert, updateSyncDate, getLastSyncDate }
}