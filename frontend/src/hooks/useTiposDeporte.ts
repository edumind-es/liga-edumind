import { useQuery } from '@tanstack/react-query';
import { tiposDeporteApi } from '../api/tiposDeporte';

export function useTiposDeporte() {
    return useQuery({
        queryKey: ['tiposDeporte'],
        queryFn: () => tiposDeporteApi.getAll(),
    });
}
