import { useParams, Link } from 'react-router-dom';
import { Plus, Calendar, Trophy, Clock, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { usePartidos, useDeletePartido } from '@/hooks/usePartidos';
import { useLiga } from '@/hooks/useLigas';
import { Button } from '@/components/ui/button';
import { LMEButton } from '@/components/ui/lme-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ListaPartidos() {
    const { ligaId } = useParams<{ ligaId: string }>();
    const { data: liga, isLoading: isLoadingLiga } = useLiga(ligaId ? parseInt(ligaId) : 0);
    const { data: partidos, isLoading: isLoadingPartidos } = usePartidos(ligaId ? parseInt(ligaId) : 0);
    const deletePartido = useDeletePartido();

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este partido?')) return;

        try {
            await deletePartido.mutateAsync(id);
            toast.success('Partido eliminado');
        } catch {
            toast.error('Error al eliminar el partido');
        }
    };

    if (isLoadingLiga || isLoadingPartidos) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!liga) return <div className="p-8 text-center text-red-500">Liga no encontrada</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link to={`/ligas/${ligaId}`} className="inline-flex items-center text-sm text-lme-muted hover:text-lme-primary transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a la liga
                </Link>
            </div>

            <PageHeader
                title="Partidos"
                description={`Gestiona los partidos de ${liga.nombre}`}
                className="mb-8"
            >
                <Link to={`/ligas/${ligaId}/partidos/crear`}>
                    <LMEButton className="shadow-lg hover:shadow-xl transition-all">
                        <Plus className="h-5 w-5 mr-2" />
                        Nuevo Partido
                    </LMEButton>
                </Link>
            </PageHeader>

            <div className="space-y-4">
                {partidos?.map((partido) => (
                    <Card key={partido.id} variant="glass" className="overflow-hidden hover:scale-[1.01] transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3 text-sm text-lme-muted mb-4">
                                        <Badge variant="outline" className="bg-white/50 border-lme-border text-lme-text font-medium">
                                            {partido.tipo_deporte.nombre}
                                        </Badge>
                                        {partido.fecha_hora && (
                                            <span className="flex items-center gap-1.5 bg-white/30 px-2 py-1 rounded-md border border-white/20">
                                                <Calendar className="h-3.5 w-3.5 text-lme-primary" />
                                                <span className="font-medium text-lme-text">
                                                    {new Date(partido.fecha_hora).toLocaleDateString()}
                                                </span>
                                                <span className="text-lme-muted mx-1">|</span>
                                                <span className="font-medium text-lme-text">
                                                    {new Date(partido.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </span>
                                        )}
                                        {partido.finalizado ? (
                                            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                                <Trophy className="h-3 w-3 mr-1" /> Finalizado
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
                                                <Clock className="h-3 w-3 mr-1" /> Pendiente
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between md:justify-start md:gap-16 text-xl">
                                        <div className="flex items-center gap-4 flex-1 justify-end md:justify-end">
                                            <span className="text-right font-bold text-lme-text">{partido.equipo_local.nombre}</span>
                                            {partido.finalizado && (
                                                <span className="bg-white/80 px-4 py-2 rounded-lg min-w-[3.5rem] text-center font-black text-2xl shadow-sm border border-lme-border text-lme-primary">
                                                    {partido.puntos_local}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-lme-muted font-light px-4 text-sm uppercase tracking-widest">VS</span>
                                        <div className="flex items-center gap-4 flex-1">
                                            {partido.finalizado && (
                                                <span className="bg-white/80 px-4 py-2 rounded-lg min-w-[3.5rem] text-center font-black text-2xl shadow-sm border border-lme-border text-lme-primary">
                                                    {partido.puntos_visitante}
                                                </span>
                                            )}
                                            <span className="font-bold text-lme-text">{partido.equipo_visitante.nombre}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto justify-end border-t border-lme-border md:border-t-0 pt-4 md:pt-0">
                                    <Button variant="outline" size="sm" asChild className="hover:bg-lme-primary hover:text-white transition-colors">
                                        <Link to={`/ligas/${ligaId}/partidos/${partido.id}`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Ver / Editar
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-lme-muted hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(partido.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!partidos || partidos.length === 0) && (
                    <Card variant="glass" className="text-center py-12 border-dashed border-2">
                        <CardContent>
                            <div className="mx-auto h-12 w-12 text-lme-muted mb-4">
                                <Trophy className="h-12 w-12 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-lme-text">No hay partidos registrados</h3>
                            <p className="text-lme-muted mt-1 mb-4">Comienza creando el calendario de la liga</p>
                            <Button asChild>
                                <Link to={`/ligas/${ligaId}/partidos/crear`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear el primer partido
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
