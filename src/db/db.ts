import * as SQLite from 'expo-sqlite';

export async function initializeDatabase(database: SQLite.SQLiteDatabase) {
    
    await database.execAsync(`

        CREATE TABLE IF NOT EXISTS sync_metadata (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            last_sync_at DATETIME
        );

        CREATE TABLE IF NOT EXISTS lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            server_id INTEGER UNIQUE,  
            name TEXT NOT NULL,
            owner_ids TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            deleted_at DATETIME,
            sync_status TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            server_id INTEGER UNIQUE,
            list_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            checked INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            deleted_at DATETIME,
            sync_status TEXT NOT NULL
        );
    `)
}