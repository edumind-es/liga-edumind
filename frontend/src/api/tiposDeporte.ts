import { ApiClient } from './client';
import { TipoDeporte } from '../types/liga';

class TiposDeporteApi extends ApiClient {
    async getAll() {
        const response = await this.client.get<TipoDeporte[]>('/tipos-deporte/');
        return response.data;
    }

    async getById(id: number) {
        const response = await this.client.get<TipoDeporte>(`/tipos-deporte/${id}`);
        return response.data;
    }
}

export const tiposDeporteApi = new TiposDeporteApi();
