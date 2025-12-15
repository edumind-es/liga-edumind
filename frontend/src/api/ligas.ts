import { apiClient } from './client';
import { Liga, LigaWithStats, CreateLigaData, UpdateLigaData } from '@/types/liga';

export const ligasApi = {
    getAll: async (): Promise<Liga[]> => {
        const response = await apiClient.client.get('/ligas/');
        return response.data;
    },

    getById: async (id: number): Promise<LigaWithStats> => {
        const response = await apiClient.client.get(`/ligas/${id}`);
        return response.data;
    },

    create: async (data: CreateLigaData): Promise<Liga> => {
        const response = await apiClient.client.post('/ligas/', data);
        return response.data;
    },

    update: async (id: number, data: UpdateLigaData): Promise<Liga> => {
        const response = await apiClient.client.put(`/ligas/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.client.delete(`/ligas/${id}`);
    },

    getClasificacion: async (id: number) => {
        const response = await apiClient.client.get(`/ligas/${id}/clasificacion`);
        return response.data;
    },

    generatePublicPin: async (id: number): Promise<{ public_pin: string }> => {
        const response = await apiClient.client.post(`/ligas/${id}/public-pin`);
        return response.data;
    },

    disablePublicPin: async (id: number): Promise<void> => {
        await apiClient.client.delete(`/ligas/${id}/public-pin`);
    },

    // Exportaciones
    exportPDF: async (ligaId: number): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
        const response = await fetch(`${apiUrl}/ligas/${ligaId}/export/clasificacion/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al exportar PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clasificacion_${ligaId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    exportCSV: async (ligaId: number): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
        const response = await fetch(`${apiUrl}/ligas/${ligaId}/export/clasificacion/csv`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al exportar CSV');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clasificacion_${ligaId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
};
