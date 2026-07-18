export function buildUpdateQuery(
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