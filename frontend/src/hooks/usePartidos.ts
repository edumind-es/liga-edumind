import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partidosApi } from '../api/partidos';
import { PartidoCreate, PartidoUpdateMarcador, PartidoUpdateEvaluacion } from '../types/liga';

export function usePartidos(ligaId?: number) {
    return useQuery({
        queryKey: ['partidos', { ligaId }],
        queryFn: () => partidosApi.getAll(ligaId ? { liga_id: ligaId } : undefined),
        enabled: !!ligaId,
    });
}

export function usePartido(id: number) {
    return useQuery({
        queryKey: ['partidos', id],
        queryFn: () => partidosApi.getById(id),
        enabled: !!id,
    });
}

export function useCreatePartido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PartidoCreate) => partidosApi.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['partidos', { ligaId: variables.liga_id }] });
        },
    });
}

export function useDeletePartido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => partidosApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partidos'] });
        },
    });
}

export function useUpdateMarcador() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: PartidoUpdateMarcador }) =>
            partidosApi.updateMarcador(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['partidos', data.id] });
            queryClient.invalidateQueries({ queryKey: ['partidos'] });
        },
    });
}

export function useUpdateEvaluacion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: PartidoUpdateEvaluacion }) =>
            partidosApi.updateEvaluacion(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['partidos', data.id] });
            queryClient.invalidateQueries({ queryKey: ['partidos'] });
        },
    });
}
