import { apiClient } from './client';
import { JornadaWithStats, JornadaCreate, JornadaUpdate } from '@/types/liga';

export const jornadasApi = {
    getAllByLiga: async (ligaId: number): Promise<JornadaWithStats[]> => {
        const response = await apiClient.client.get(`/jornadas/?liga_id=${ligaId}`);
        return response.data;
    },

    getById: async (id: number): Promise<JornadaWithStats> => {
        const response = await apiClient.client.get(`/jornadas/${id}`);
        return response.data;
    },

    create: async (data: JornadaCreate): Promise<JornadaWithStats> => {
        const response = await apiClient.client.post('/jornadas/', data);
        return response.data;
    },

    update: async (id: number, data: JornadaUpdate): Promise<JornadaWithStats> => {
        const response = await apiClient.client.put(`/jornadas/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.client.delete(`/jornadas/${id}`);
    },

    generateCalendario: async (jornadaId: number, tipoDeporteId: number) => {
        const response = await apiClient.client.post(
            `/jornadas/${jornadaId}/generar-calendario`,
            null,
            { params: { tipo_deporte_id: tipoDeporteId } }
        );
        return response.data;
    }
};
