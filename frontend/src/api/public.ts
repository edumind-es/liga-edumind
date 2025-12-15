import { apiClient } from './client';
import { LigaResponse } from '@/types/liga';

export const publicApi = {
    login: async (ligaId: number, pin: string) => {
        const response = await apiClient.client.post('/public/login', { liga_id: ligaId, pin });
        return response.data;
    },

    getLiga: async (ligaId: number, token: string): Promise<LigaResponse> => {
        const response = await apiClient.client.get(`/public/ligas/${ligaId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getClasificacion: async (ligaId: number, token: string) => {
        const response = await apiClient.client.get(`/public/ligas/${ligaId}/clasificacion`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getJornadas: async (ligaId: number, token: string) => {
        const response = await apiClient.client.get(`/public/ligas/${ligaId}/jornadas`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
