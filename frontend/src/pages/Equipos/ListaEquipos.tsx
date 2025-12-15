import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Shield, BarChart2, Loader2 } from 'lucide-react';
import { equiposApi } from '@/api/equipos';
import { ligasApi } from '@/api/ligas';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Equipo, Liga } from '@/types/liga';
import { getImageUrl } from '@/utils/url';

export default function ListaEquipos() {
    const { ligaId } = useParams<{ ligaId: string }>();
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [liga, setLiga] = useState<Liga | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (ligaId) {
            loadData(parseInt(ligaId));
        }
    }, [ligaId]);

    const loadData = async (id: number) => {
        try {
            const [ligaData, equiposData] = await Promise.all([
                ligasApi.getById(id),
                equiposApi.getAllByLiga(id)
            ]);
            setLiga(ligaData);
            setEquipos(equiposData);
        } catch {
            setError('Error al cargar los datos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este equipo?')) {
            return;
        }
        try {
            await equiposApi.delete(id);
            setEquipos(equipos.filter(e => e.id !== id));
        } catch {
            alert('Error al eliminar el equipo');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-mint" />
                    <p className="text-sub text-sm">Cargando equipos...</p>
                </div>
            </div>
        );
    }

    if (!liga) {
        return (
            <div className="p-8 text-center rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="font-semibold text-red-400">Liga no encontrada</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="mb-6">
                <Link to={`/ligas/${liga.id}`} className="inline-flex items-center text-sm text-sub hover:text-mint transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Volver a la liga
                </Link>
            </div>

            <PageHeader
                title="Equipos"
                description={`Gestiona los equipos de ${liga.nombre}`}
                className="mb-8"
            >
                <Link to={`/ligas/${liga.id}/equipos/crear`}>
                    <Button className="gap-2">
                        <Plus className="h-5 w-5" />
                        Nuevo Equipo
                    </Button>
                </Link>
            </PageHeader>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            )}

            {equipos.length === 0 ? (
                <Card variant="glass" className="text-center py-16">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-vio/20 to-edufis-mental-end/20 border border-vio/20 mb-2">
                            <Shield className="h-12 w-12 text-vio" />
                        </div>
                        <h3 className="text-2xl font-bold text-ink">No hay equipos</h3>
                        <p className="text-sub max-w-md mx-auto">
                            Añade equipos para comenzar la competición.
                        </p>
                        <Link to={`/ligas/${liga.id}/equipos/crear`} className="mt-4 inline-block">
                            <Button size="lg" className="gap-2">
                                <Plus className="h-5 w-5" />
                                Crear Equipo
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {equipos.map((equipo) => (
                        <Card key={equipo.id} variant="elevated" className="flex flex-col h-full">
                            <CardContent className="p-5 flex-1">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-14 w-14 border-2 border-lme-border shadow-glass">
                                            {equipo.logo_filename ? (
                                                <AvatarImage src={getImageUrl(`/static/uploads/${equipo.logo_filename}`)} alt={equipo.nombre} className="object-cover" />
                                            ) : (
                                                <AvatarFallback
                                                    className="text-white font-bold text-lg"
                                                    style={{ backgroundColor: equipo.color_principal || '#3c7dff' }}
                                                >
                                                    {equipo.nombre.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-bold text-ink">{equipo.nombre}</h3>
                                            <p className="text-xs text-sub">ID: {equipo.id}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center text-sm mb-5">
                                    <div className="bg-lme-surface-soft p-3 rounded-xl border border-lme-border">
                                        <div className="font-bold text-ink text-xl">{equipo.puntos_totales}</div>
                                        <div className="text-sub text-[10px] uppercase tracking-wider font-semibold">Puntos</div>
                                    </div>
                                    <div className="bg-mint/10 p-3 rounded-xl border border-mint/20">
                                        <div className="font-bold text-mint text-xl">{equipo.ganados}</div>
                                        <div className="text-mint/70 text-[10px] uppercase tracking-wider font-semibold">Ganados</div>
                                    </div>
                                    <div className="bg-sky/10 p-3 rounded-xl border border-sky/20">
                                        <div className="font-bold text-sky text-xl">{equipo.puntos_juego_limpio}</div>
                                        <div className="text-sky/70 text-[10px] uppercase tracking-wider font-semibold">J. Limpio</div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-lme-border">
                                    <Link to={`/ligas/${liga.id}/equipos/${equipo.id}/analytics`}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-sub hover:text-vio hover:bg-vio/10" title="Analítica">
                                            <BarChart2 className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link to={`/ligas/${liga.id}/equipos/${equipo.id}/editar`}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-sub hover:text-sky hover:bg-sky/10" title="Editar">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(equipo.id)}
                                        className="h-9 w-9 text-sub hover:text-red-400 hover:bg-red-500/10"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
