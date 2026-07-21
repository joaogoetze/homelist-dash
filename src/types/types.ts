export type ListDatabase = {
    id: number,
    server_id: number,
    name: string,
    owner_id: number,
    sync_status: string,
}

export type ItemDatabase = {
    id: number;
    list_id: number;
    server_id: number | null;
    name: string;
    checked: boolean;
    sync_status?: string;
};

export type LoggedUser = {
    id: number,
    name: string | null,
    email: string
}