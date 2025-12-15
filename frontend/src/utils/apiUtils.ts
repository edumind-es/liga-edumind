import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
    if (!error) return 'Ha ocurrido un error desconocido';

    if (error instanceof AxiosError && error.response?.data) {
        const detail = error.response.data.detail;

        if (Array.isArray(detail)) {
            return detail.map((err: { msg: string }) => err.msg).join(', ');
        }

        // Handle simple string errors
        if (typeof detail === 'string') {
            return detail;
        }

        // Handle object errors (fallback)
        if (typeof detail === 'object') {
            return JSON.stringify(detail);
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}
