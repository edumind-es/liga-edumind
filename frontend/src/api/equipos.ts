import { apiClient } from './client';
import { Equipo, EquipoCreate, EquipoUpdate } from '@/types/liga';

export const equiposApi = {
    getAllByLiga: async (ligaId: number): Promise<Equipo[]> => {
        const response = await apiClient.client.get(`/equipos/?liga_id=${ligaId}`);
        return response.data;
    },

    getById: async (id: number): Promise<Equipo> => {
        const response = await apiClient.client.get(`/equipos/${id}`);
        return response.data;
    },

    create: async (data: EquipoCreate): Promise<Equipo> => {
        const response = await apiClient.client.post('/equipos/', data);
        return response.data;
    },

    update: async (id: number, data: EquipoUpdate): Promise<Equipo> => {
        const response = await apiClient.client.put(`/equipos/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.client.delete(`/equipos/${id}`);
    },


    uploadLogo: async (id: number, file: File): Promise<{ logo_url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.client.post(`/equipos/${id}/logo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getStatsHistory: async (id: number): Promise<any[]> => {
        const response = await apiClient.client.get(`/equipos/${id}/stats_history`);
        return response.data;
    },

    regenerateToken: async (id: number): Promise<{ acceso_token: string }> => {
        const response = await apiClient.client.post(`/equipos/${id}/regenerate_token`);
        return response.data;
    },

    getBadges: async (id: number): Promise<any[]> => {
        const response = await apiClient.client.get(`/equipos/${id}/badges`);
        return response.data;
    }
};
