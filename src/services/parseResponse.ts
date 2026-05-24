import { ApiError } from "./api-error";

export async function parseResponse(response: Response) {
    let data: any = null;

    try {
        data = await response.json();
    } catch {}

    if (!response.ok) {
        throw new ApiError(
            data?.message || 'Ocorreu um erro inesperado',
            response.status,
            data?.code
        );
    }

    return data;
}