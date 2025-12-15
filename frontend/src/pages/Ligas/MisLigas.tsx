import { Link } from 'react-router-dom';
import { Plus, Calendar, BarChart2, Users, Trash2, Trophy, Loader2 } from 'lucide-react';
import { ligasApi } from '@/api/ligas';
import { useLigas } from '@/hooks/useLigas';
import { getErrorMessage } from '@/utils/apiUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function MisLigas() {
    const { data: ligas, isLoading, error, refetch } = useLigas();

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta liga? Esta acción no se puede deshacer.')) {
            return;
        }
        try {
            await ligasApi.delete(id);
            toast.success('Liga eliminada correctamente');
            refetch();
        } catch {
            toast.error('Error al eliminar la liga');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 bg-lme-surface-soft" />
                        <Skeleton className="h-4 w-64 bg-lme-surface-soft" />
                    </div>
                    <Skeleton className="h-10 w-32 bg-lme-surface-soft" />
                </div>
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-mint" />
                        <p className="text-sub text-sm">Cargando ligas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="font-semibold text-red-400">Error al cargar las ligas</p>
                <p className="text-sm mt-1 text-red-300">{getErrorMessage(error)}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Mis Ligas"
                description="Gestiona tus competiciones escolares, organiza calendarios y sigue el progreso de tus alumnos."
            >
                <Link to="/ligas/crear">
                    <Button className="gap-2">
                        <Plus className="h-5 w-5" />
                        Nueva Liga
                    </Button>
                </Link>
            </PageHeader>

            {/* Content */}
            {!ligas || ligas.length === 0 ? (
                <Card variant="glass" className="text-center py-16">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-mint/20 to-sky/20 border border-mint/20 mb-2">
                            <Trophy className="h-12 w-12 text-mint" />
                        </div>
                        <h3 className="text-2xl font-bold text-ink">No tienes ligas activas</h3>
                        <p className="text-sub max-w-md mx-auto">
                            Empieza creando tu primera liga escolar para gestionar equipos y partidos con el modelo LME.
                        </p>
                        <Link to="/ligas/crear" className="mt-4 inline-block">
                            <Button size="lg" className="gap-2">
                                <Plus className="h-5 w-5" />
                                Crear Liga
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {ligas.map((liga) => (
                        <Card key={liga.id} variant="elevated" className="flex flex-col h-full">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/ligas/${liga.id}`} className="block group">
                                            <CardTitle className="text-lg truncate group-hover:text-mint transition-colors">
                                                {liga.nombre}
                                            </CardTitle>
                                        </Link>
                                        <p className="text-sm text-sub mt-1">
                                            {liga.temporada || 'Temporada actual'}
                                        </p>
                                    </div>
                                    <Badge variant={liga.activa ? "success" : "secondary"}>
                                        {liga.activa ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 pb-4">
                                <p className="text-sm text-sub line-clamp-3">
                                    {liga.descripcion || 'Sin descripción disponible para esta liga.'}
                                </p>
                            </CardContent>

                            <div className="p-4 pt-0 mt-auto border-t border-lme-border flex items-center justify-between gap-2">
                                <div className="flex gap-1">
                                    <Link to={`/ligas/${liga.id}`}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-sub hover:text-mint hover:bg-mint/10" title="Gestionar">
                                            <Users className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link to={`/ligas/${liga.id}/jornadas`}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-sub hover:text-sky hover:bg-sky/10" title="Calendario">
                                            <Calendar className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link to={`/ligas/${liga.id}/clasificacion`}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-sub hover:text-vio hover:bg-vio/10" title="Clasificación">
                                            <BarChart2 className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(liga.id)}
                                    className="h-9 w-9 text-sub hover:text-red-400 hover:bg-red-500/10"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
