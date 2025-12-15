import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jornadasApi } from '../api/jornadas';
import { JornadaCreate, JornadaUpdate } from '../types/liga';

export function useJornadas(ligaId: number) {
    return useQuery({
        queryKey: ['jornadas', { ligaId }],
        queryFn: () => jornadasApi.getAllByLiga(ligaId),
        enabled: !!ligaId,
    });
}

export function useJornada(id: number) {
    return useQuery({
        queryKey: ['jornadas', id],
        queryFn: () => jornadasApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateJornada() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: JornadaCreate) => jornadasApi.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['jornadas', { ligaId: variables.liga_id }] });
        },
    });
}

export function useUpdateJornada() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: JornadaUpdate }) => jornadasApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['jornadas', data.id] });
            queryClient.invalidateQueries({ queryKey: ['jornadas', { ligaId: data.liga_id }] });
        },
    });
}

export function useDeleteJornada() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => jornadasApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jornadas'] });
        },
    });
}

export function useGenerateCalendarioJornada() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ jornadaId, tipoDeporteId }: { jornadaId: number; tipoDeporteId: number }) =>
            jornadasApi.generateCalendario(jornadaId, tipoDeporteId),
        onSuccess: () => {
            // Invalidate jornadas and partidos queries
            queryClient.invalidateQueries({ queryKey: ['jornadas'] });
            queryClient.invalidateQueries({ queryKey: ['partidos'] });
        },
    });
}
