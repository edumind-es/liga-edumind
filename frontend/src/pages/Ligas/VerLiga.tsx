import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Trophy, Settings, Trash2, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ligasApi } from '@/api/ligas';
import { useLiga } from '@/hooks/useLigas';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/utils/apiUtils';
import { toast } from 'sonner';

export default function VerLiga() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: liga, isLoading, error } = useLiga(id ? parseInt(id) : 0);

    const handleDelete = async () => {
        if (!liga) return;
        if (!window.confirm('¿Estás seguro de eliminar esta liga? Se borrarán todos los equipos y partidos.')) {
            return;
        }
        try {
            await ligasApi.delete(liga.id);
            toast.success('Liga eliminada correctamente');
            navigate('/ligas');
        } catch {
            toast.error('Error al eliminar la liga');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-mint" />
                        <p className="text-sub text-sm">Cargando liga...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !liga) {
        return (
            <div className="p-8 text-center rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="font-semibold text-red-400">{error ? 'Error al cargar la liga' : 'Liga no encontrada'}</p>
                {error && <p className="text-sm mt-1 text-red-300">{getErrorMessage(error)}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="mb-6">
                <Link
                    to="/ligas"
                    className="inline-flex items-center text-sm text-sub hover:text-mint transition-colors no-underline"
                >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Volver a mis ligas
                </Link>
            </div>

            <PageHeader
                title={liga.nombre}
                description={liga.descripcion || 'Sin descripción'}
                className="mb-4"
            >
                <div className="flex items-center gap-2">
                    {liga.temporada && (
                        <Badge variant="outline">
                            {liga.temporada}
                        </Badge>
                    )}
                    <Badge variant="accent">
                        {liga.tipo_deporte?.nombre || 'Deporte'}
                    </Badge>
                </div>
            </PageHeader>

            {/* Botón de eliminar separado para evitar conflicto con animaciones del header */}
            <div className="mb-8 flex justify-end">
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Liga
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Equipos Card */}
                <div
                    className="glass-card group relative overflow-hidden cursor-pointer transition-all border-l-4 border-l-mint"
                    onClick={() => navigate(`/ligas/${liga.id}/equipos`)}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                        <Users className="w-32 h-32 text-mint" />
                    </div>
                    <div className="p-5 relative z-10">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <h3 className="text-lg font-semibold text-ink">Equipos</h3>
                            <div className="p-2 bg-mint/20 rounded-lg text-mint group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-4xl font-bold text-ink mb-1">{liga.total_equipos}</div>
                            <p className="text-sm text-ink/80 mb-6">Equipos inscritos</p>
                            <Button className="w-full" size="sm">
                                Gestionar Equipos
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Jornadas Card */}
                <div
                    className="glass-card group relative overflow-hidden cursor-pointer transition-all border-l-4 border-l-vio"
                    onClick={() => navigate(`/ligas/${liga.id}/jornadas`)}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                        <Calendar className="w-32 h-32 text-vio" />
                    </div>
                    <div className="p-5 relative z-10">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <h3 className="text-lg font-semibold text-ink">Jornadas</h3>
                            <div className="p-2 bg-vio/20 rounded-lg text-vio group-hover:scale-110 transition-transform">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-4xl font-bold text-ink mb-1">{liga.total_jornadas}</div>
                            <p className="text-sm text-ink/80 mb-6">Jornadas planificadas</p>
                            <Button variant="emocional" className="w-full" size="sm">
                                Ver Calendario
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Partidos Card */}
                <div
                    className="glass-card group relative overflow-hidden cursor-pointer transition-all border-l-4 border-l-sky"
                    onClick={() => navigate(`/ligas/${liga.id}/partidos`)}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                        <Trophy className="w-32 h-32 text-sky" />
                    </div>
                    <div className="p-5 relative z-10">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <h3 className="text-lg font-semibold text-ink">Partidos</h3>
                            <div className="p-2 bg-sky/20 rounded-lg text-sky group-hover:scale-110 transition-transform">
                                <Trophy className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-4xl font-bold text-ink mb-1">{liga.total_partidos}</div>
                            <p className="text-sm text-ink/80 mb-6">Partidos jugados</p>
                            <Button variant="fisico" className="w-full" size="sm">
                                Ver Resultados
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Clasificación Card */}
                <div
                    className="glass-card group relative overflow-hidden cursor-pointer transition-all border-l-4 border-l-orange-500"
                    onClick={() => navigate(`/ligas/${liga.id}/clasificacion`)}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                        <FileSpreadsheet className="w-32 h-32 text-orange-500" />
                    </div>
                    <div className="p-5 relative z-10">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <h3 className="text-lg font-semibold text-ink">Clasificación</h3>
                            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-4xl font-bold text-ink mb-1">{liga.total_equipos}</div>
                            <p className="text-sm text-ink/80 mb-6">Posiciones actuales</p>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm">
                                Ver Tabla
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuration Section */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-lme-border pb-4">
                    <div className="p-2 bg-sub/20 rounded-lg text-sub">
                        <Settings className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-ink">Configuración y Exportación</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        to={`/ligas/${liga.id}/configuracion`}
                        className="group flex flex-col p-4 rounded-xl border border-lme-border bg-lme-surface-soft/50 hover:bg-lme-surface-soft hover:border-mint/50 transition-all no-underline"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-sub/10 rounded-lg text-sub group-hover:text-mint group-hover:bg-mint/10 transition-colors">
                                <Settings className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-ink group-hover:text-mint transition-colors">Configuración</span>
                        </div>
                        <p className="text-xs text-sub pl-1">Editar nombre y temporada</p>
                    </Link>

                    <button
                        onClick={async () => {
                            try {
                                await ligasApi.exportPDF(liga.id);
                                toast.success('PDF descargado correctamente');
                            } catch (error) {
                                toast.error('Error al exportar PDF');
                                console.error(error);
                            }
                        }}
                        className="group flex flex-col p-4 rounded-xl border border-lme-border bg-lme-surface-soft/50 hover:bg-lme-surface-soft hover:border-red-400/50 transition-all text-left"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-400 group-hover:bg-red-500/20 transition-colors">
                                <FileText className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-ink group-hover:text-red-400 transition-colors">Exportar PDF</span>
                        </div>
                        <p className="text-xs text-sub pl-1">Clasificación oficial</p>
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                await ligasApi.exportCSV(liga.id);
                                toast.success('CSV descargado correctamente');
                            } catch (error) {
                                toast.error('Error al exportar CSV');
                                console.error(error);
                            }
                        }}
                        className="group flex flex-col p-4 rounded-xl border border-lme-border bg-lme-surface-soft/50 hover:bg-lme-surface-soft hover:border-mint/50 transition-all text-left"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-mint/10 rounded-lg text-mint group-hover:bg-mint/20 transition-colors">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-ink group-hover:text-mint transition-colors">Exportar CSV</span>
                        </div>
                        <p className="text-xs text-sub pl-1">Datos para Excel</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
