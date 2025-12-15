import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ligasApi } from '../api/ligas';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/apiUtils';

export function useLigas() {
    return useQuery({
        queryKey: ['ligas'],
        queryFn: () => ligasApi.getAll(),
    });
}

export function useLiga(id: number) {
    return useQuery({
        queryKey: ['ligas', id],
        queryFn: () => ligasApi.getById(id),
        enabled: !!id,
    });
}

export function useClasificacion(id: number) {
    return useQuery({
        queryKey: ['clasificacion', id],
        queryFn: () => ligasApi.getClasificacion(id),
        enabled: !!id,
    });
}

export function useUpdateLiga() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: import('../types/liga').UpdateLigaData }) =>
            ligasApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ligas'] });
            queryClient.invalidateQueries({ queryKey: ['ligas', data.id] });
            toast.success('Liga actualizada correctamente');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
