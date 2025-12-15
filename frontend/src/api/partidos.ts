import { ApiClient } from './client';
import { PartidoCreate, PartidoResponse, PartidoDetailed, PartidoUpdateMarcador, PartidoUpdateEvaluacion } from '../types/liga';

class PartidosApi extends ApiClient {
    async getAll(filters?: { liga_id?: number; jornada_id?: number; equipo_id?: number }) {
        const params = new URLSearchParams();
        if (filters?.liga_id) params.append('liga_id', filters.liga_id.toString());
        if (filters?.jornada_id) params.append('jornada_id', filters.jornada_id.toString());
        if (filters?.equipo_id) params.append('equipo_id', filters.equipo_id.toString());

        const response = await this.client.get<PartidoDetailed[]>(`/partidos/?${params.toString()}`);
        return response.data;
    }

    async getById(id: number) {
        const response = await this.client.get<PartidoDetailed>(`/partidos/${id}`);
        return response.data;
    }

    async create(data: PartidoCreate) {
        const response = await this.client.post<PartidoResponse>('/partidos/', data);
        return response.data;
    }

    async updateMarcador(id: number, data: PartidoUpdateMarcador) {
        const response = await this.client.put<PartidoResponse>(`/partidos/${id}/marcador`, data);
        return response.data;
    }

    async updateEvaluacion(id: number, data: PartidoUpdateEvaluacion) {
        const response = await this.client.put<PartidoResponse>(`/partidos/${id}/evaluacion`, data);
        return response.data;
    }

    async delete(id: number) {
        await this.client.delete(`/partidos/${id}`);
    }
}

export const partidosApi = new PartidosApi();
