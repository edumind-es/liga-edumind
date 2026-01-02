import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { partidosApi } from '../../api/partidos';
import { PartidoDetailed, Marcador } from '../../types/liga';
import { Trophy, Medal, User, FileText, Users } from 'lucide-react';
import ScoreboardDisplay from '../Express/scoreboard/ScoreboardDisplay';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EvaluationRadarChart } from '@/components/charts/EvaluationRadarChart';
export default function VerPartido() {
    const { ligaId, partidoId } = useParams<{ ligaId: string; partidoId: string }>();
    const [partido, setPartido] = useState<PartidoDetailed | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'marcador' | 'evaluacion'>('marcador');

    // Marcador state
    const [marcador, setMarcador] = useState<Marcador>({});

    // Evaluación state
    const [evaluacion, setEvaluacion] = useState({
        puntos_juego_limpio_local: 0,
        puntos_juego_limpio_visitante: 0,
        arbitro_conocimiento: 0,
        arbitro_gestion: 0,
        arbitro_apoyo: 0,
        grada_animar_local: 0,
        grada_respeto_local: 0,
        grada_participacion_local: 0,
        grada_animar_visitante: 0,
        grada_respeto_visitante: 0,
        grada_participacion_visitante: 0
    });

    useEffect(() => {
        if (partidoId) {
            loadPartido(parseInt(partidoId));
        }
    }, [partidoId]);

    const loadPartido = async (id: number) => {
        try {
            const data = await partidosApi.getById(id);
            setPartido(data);
            setMarcador(data.marcador || {});
            setEvaluacion({
                puntos_juego_limpio_local: data.puntos_juego_limpio_local || 0,
                puntos_juego_limpio_visitante: data.puntos_juego_limpio_visitante || 0,
                arbitro_conocimiento: data.arbitro_conocimiento || 0,
                arbitro_gestion: data.arbitro_gestion || 0,
                arbitro_apoyo: data.arbitro_apoyo || 0,
                grada_animar_local: data.grada_animar_local || 0,
                grada_respeto_local: data.grada_respeto_local || 0,
                grada_participacion_local: data.grada_participacion_local || 0,
                grada_animar_visitante: data.grada_animar_visitante || 0,
                grada_respeto_visitante: data.grada_respeto_visitante || 0,
                grada_participacion_visitante: data.grada_participacion_visitante || 0
            });
        } catch {
            setError('Error al cargar el partido');
        } finally {
            setIsLoading(false);
        }
    };



    const handleUpdateEvaluacion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!partido) return;

        try {
            await partidosApi.updateEvaluacion(partido.id, evaluacion);
            toast.success('Evaluación actualizada correctamente');
            loadPartido(partido.id);
        } catch {
            toast.error('Error al actualizar evaluación');
        }
    };

    const handleMarcadorUpdate = async (updates: Record<string, any>) => {
        if (!partido) return;

        const newMarcador = { ...marcador, ...updates };
        setMarcador(newMarcador);

        try {
            await partidosApi.updateMarcador(partido.id, { marcador: newMarcador });
        } catch (error) {
            console.error('Error updating marcador:', error);
            toast.error('Error al actualizar marcador');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!partido) return <div className="p-8 text-center">Partido no encontrado</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link to={`/ligas/${ligaId}/partidos`} className="inline-flex items-center text-sm text-lme-muted hover:text-lme-primary transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a partidos
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <PageHeader
                    title={`${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}`}
                    description={`${partido.tipo_deporte.nombre} - ${new Date(partido.fecha_hora || '').toLocaleString()}`}
                    className="mb-0"
                />
                <Button
                    variant="outline"
                    onClick={async () => {
                        try {
                            const token = localStorage.getItem('auth_token');
                            const response = await fetch(
                                `${import.meta.env.VITE_API_URL || '/api/v1'}/partidos/${partido.id}/export/acta`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                }
                            );

                            if (!response.ok) {
                                toast.error('Error al descargar acta');
                                return;
                            }

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `acta_partido_${partido.id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        } catch (error) {
                            console.error('Error downloading PDF:', error);
                            toast.error('Error al descargar acta');
                        }
                    }}
                    className="shadow-sm hover:shadow-md transition-all"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Descargar Acta
                </Button>
                {!partido.finalizado && (
                    <Button
                        onClick={async () => {
                            // Check for missing evaluations
                            const hasValues =
                                evaluacion.puntos_juego_limpio_local > 0 ||
                                evaluacion.puntos_juego_limpio_visitante > 0 ||
                                evaluacion.arbitro_conocimiento > 0 ||
                                evaluacion.grada_animar_local > 0 ||
                                evaluacion.grada_animar_visitante > 0;

                            if (!hasValues) {
                                const shouldReview = window.confirm(
                                    'Parece que NO has introducido la Evaluación de Valores (Juego Limpio, Árbitro, Grada).\n\n' +
                                    '¿Deseas ir a la pestaña de Evaluación para completarla antes de finalizar?\n\n' +
                                    'Cancelar = Ir a Evaluar\nAceptar = Finalizar sin evaluar (0 puntos)'
                                );

                                if (!shouldReview) {
                                    setActiveTab('evaluacion');
                                    toast.info('Por favor, completa la evaluación de valores.');
                                    return;
                                }
                            }

                            if (!window.confirm('¿Estás seguro de finalizar este partido? Esta acción calculará los puntos finales y actualizará la clasificación.')) {
                                return;
                            }
                            try {
                                // Auto-save evaluation before finalizing to ensure data persistence
                                await partidosApi.updateEvaluacion(partido.id, evaluacion);

                                await partidosApi.finalizar(partido.id);
                                toast.success('Partido finalizado correctamente');
                                loadPartido(partido.id);
                            } catch (error) {
                                console.error('Error finalizing match:', error);
                                toast.error('Error al finalizar el partido');
                            }
                        }}
                        className="bg-gradient-to-r from-mint to-sky shadow-sm hover:shadow-md transition-all"
                    >
                        <Trophy className="h-4 w-4 mr-2" />
                        Finalizar Partido
                    </Button>
                )}
                {partido.finalizado && (
                    <div className="px-4 py-2 rounded-lg bg-mint/20 text-mint font-semibold flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Partido Finalizado
                    </div>
                )}
            </div>

            {/* Sport-Specific Scoreboard with Timer */}
            <div className="mb-8">
                <ScoreboardDisplay
                    tipo={partido.tipo_deporte.tipo_marcador}
                    marcador={marcador}
                    onUpdate={handleMarcadorUpdate}
                />
            </div>

            <Card variant="glass" className="overflow-hidden">
                <div className="flex border-b border-lme-border bg-white/5">
                    <button
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'marcador' ? 'bg-white/10 text-lme-primary border-b-2 border-lme-primary' : 'text-lme-muted hover:text-lme-text hover:bg-white/5'}`}
                        onClick={() => setActiveTab('marcador')}
                    >
                        <Trophy className="inline-block mr-2 h-4 w-4" />
                        Marcador Deportivo
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'evaluacion' ? 'bg-white/10 text-lme-primary border-b-2 border-lme-primary' : 'text-lme-muted hover:text-lme-text hover:bg-white/5'}`}
                        onClick={() => setActiveTab('evaluacion')}
                    >
                        <Medal className="inline-block mr-2 h-4 w-4" />
                        Evaluación Educativa
                    </button>
                </div>

                <CardContent className="p-6">
                    {activeTab === 'marcador' && (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 text-lme-muted mb-4 bg-white/50 rounded-full flex items-center justify-center">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <p className="text-lme-text font-medium mb-2">Control del Marcador</p>
                            <p className="text-sm text-lme-muted">Utiliza los controles en el marcador superior para actualizar los resultados en tiempo real.</p>
                            <p className="text-xs text-lme-muted mt-2">Los cambios se guardan automáticamente.</p>
                        </div>
                    )}

                    {activeTab === 'evaluacion' && (
                        <form onSubmit={handleUpdateEvaluacion} className="space-y-8">
                            {/* Roles Display */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card variant="glass" className="bg-lme-surface-soft/50 border-lme-border">
                                    <div className="p-4 flex flex-col items-center text-center">
                                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-400 mb-2">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm text-ink/70 mb-1">Árbitro Asignado</p>
                                        <p className="font-bold text-ink text-lg">{partido.arbitro?.nombre || 'No asignado'}</p>
                                    </div>
                                </Card>
                                <Card variant="glass" className="bg-lme-surface-soft/50 border-lme-border">
                                    <div className="p-4 flex flex-col items-center text-center">
                                        <div className="p-2 rounded-full bg-green-500/10 text-green-400 mb-2">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm text-ink/70 mb-1">Grada Local (por {partido.equipo_local.nombre})</p>
                                        <p className="font-bold text-ink text-lg">{partido.tutor_grada_local?.nombre || 'No asignado'}</p>
                                    </div>
                                </Card>
                                <Card variant="glass" className="bg-lme-surface-soft/50 border-lme-border">
                                    <div className="p-4 flex flex-col items-center text-center">
                                        <div className="p-2 rounded-full bg-green-500/10 text-green-400 mb-2">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm text-ink/70 mb-1">Grada Visitante (por {partido.equipo_visitante.nombre})</p>
                                        <p className="font-bold text-ink text-lg">{partido.tutor_grada_visitante?.nombre || 'No asignado'}</p>
                                    </div>
                                </Card>
                            </div>

                            {/* Juego Limpio */}
                            <div className="bg-white/5 p-6 rounded-xl border border-lme-border shadow-sm">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-lme-text">
                                    <Medal size={20} className="text-yellow-500" /> Juego Limpio (0-1)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label>{partido.equipo_local.nombre}</Label>
                                        <Select
                                            value={evaluacion.puntos_juego_limpio_local.toString()}
                                            onValueChange={(value) => setEvaluacion({ ...evaluacion, puntos_juego_limpio_local: parseInt(value) })}
                                        >
                                            <SelectTrigger className="bg-lme-surface-soft/50 border-lme-border">
                                                <SelectValue placeholder="Puntos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">0 Puntos</SelectItem>
                                                <SelectItem value="1">1 Punto (Juego Limpio)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{partido.equipo_visitante.nombre}</Label>
                                        <Select
                                            value={evaluacion.puntos_juego_limpio_visitante.toString()}
                                            onValueChange={(value) => setEvaluacion({ ...evaluacion, puntos_juego_limpio_visitante: parseInt(value) })}
                                        >
                                            <SelectTrigger className="bg-lme-surface-soft/50 border-lme-border">
                                                <SelectValue placeholder="Puntos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">0 Puntos</SelectItem>
                                                <SelectItem value="1">1 Punto (Juego Limpio)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Árbitro */}
                            <div className="bg-white/5 p-6 rounded-xl border border-lme-border shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-lme-text">
                                        <User size={20} className="text-blue-500" /> Evaluación Árbitro (0-10)
                                    </h3>
                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                                        Evaluado: {partido.arbitro?.nombre || 'Sin árbitro'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label>Conocimiento</Label>
                                                <span className="text-lg font-bold text-mint">{evaluacion.arbitro_conocimiento}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.arbitro_conocimiento]}
                                                max={10}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, arbitro_conocimiento: v[0] })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label>Gestión</Label>
                                                <span className="text-lg font-bold text-mint">{evaluacion.arbitro_gestion}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.arbitro_gestion]}
                                                max={10}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, arbitro_gestion: v[0] })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label>Apoyo Educativo</Label>
                                                <span className="text-lg font-bold text-mint">{evaluacion.arbitro_apoyo}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.arbitro_apoyo]}
                                                max={10}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, arbitro_apoyo: v[0] })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <EvaluationRadarChart
                                            data={[
                                                { subject: 'Conocimiento', A: evaluacion.arbitro_conocimiento, fullMark: 10 },
                                                { subject: 'Gestión', A: evaluacion.arbitro_gestion, fullMark: 10 },
                                                { subject: 'Apoyo', A: evaluacion.arbitro_apoyo, fullMark: 10 },
                                            ]}
                                            color="#3b82f6" // blue-500
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Grada (Crowd) */}
                            <div className="bg-white/5 p-6 rounded-xl border border-lme-border shadow-sm">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-lme-text">
                                    <Users size={20} className="text-green-500" /> Evaluación Grada (0-4)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Local Crowd */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-lme-border pb-2">
                                            <h4 className="font-semibold text-sm text-lme-text">Grada {partido.equipo_local.nombre}</h4>
                                            <span className="text-xs text-sub text-right block max-w-[150px] truncate">
                                                (Evalúa: {partido.tutor_grada_local?.nombre || 'Sin asignar'})
                                            </span>
                                        </div>

                                        <EvaluationRadarChart
                                            data={[
                                                { subject: 'Animación', A: evaluacion.grada_animar_local, fullMark: 4 },
                                                { subject: 'Respeto', A: evaluacion.grada_respeto_local, fullMark: 4 },
                                                { subject: 'Participación', A: evaluacion.grada_participacion_local, fullMark: 4 },
                                            ]}
                                            color="#10b981" // emerald-500
                                        />

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs text-lme-muted">Animación</Label>
                                                <span className="text-sm font-bold text-mint">{evaluacion.grada_animar_local}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.grada_animar_local]}
                                                max={4}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, grada_animar_local: v[0] })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs text-lme-muted">Respeto</Label>
                                                <span className="text-sm font-bold text-mint">{evaluacion.grada_respeto_local}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.grada_respeto_local]}
                                                max={4}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, grada_respeto_local: v[0] })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs text-lme-muted">Participación</Label>
                                                <span className="text-sm font-bold text-mint">{evaluacion.grada_participacion_local}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.grada_participacion_local]}
                                                max={4}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, grada_participacion_local: v[0] })}
                                            />
                                        </div>
                                    </div>

                                    {/* Visitor Crowd */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-lme-border pb-2">
                                            <h4 className="font-semibold text-sm text-lme-text">Grada {partido.equipo_visitante.nombre}</h4>
                                            <span className="text-xs text-sub text-right block max-w-[150px] truncate">
                                                (Evalúa: {partido.tutor_grada_visitante?.nombre || 'Sin asignar'})
                                            </span>
                                        </div>

                                        <EvaluationRadarChart
                                            data={[
                                                { subject: 'Animación', A: evaluacion.grada_animar_visitante, fullMark: 4 },
                                                { subject: 'Respeto', A: evaluacion.grada_respeto_visitante, fullMark: 4 },
                                                { subject: 'Participación', A: evaluacion.grada_participacion_visitante, fullMark: 4 },
                                            ]}
                                            color="#f59e0b" // amber-500
                                        />

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs text-lme-muted">Animación</Label>
                                                <span className="text-sm font-bold text-mint">{evaluacion.grada_animar_visitante}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.grada_animar_visitante]}
                                                max={4}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, grada_animar_visitante: v[0] })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs text-lme-muted">Respeto</Label>
                                                <span className="text-sm font-bold text-mint">{evaluacion.grada_respeto_visitante}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.grada_respeto_visitante]}
                                                max={4}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, grada_respeto_visitante: v[0] })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs text-lme-muted">Participación</Label>
                                                <span className="text-sm font-bold text-mint">{evaluacion.grada_participacion_visitante}</span>
                                            </div>
                                            <Slider
                                                value={[evaluacion.grada_participacion_visitante]}
                                                max={4}
                                                step={1}
                                                onValueChange={(v: number[]) => setEvaluacion({ ...evaluacion, grada_participacion_visitante: v[0] })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-4 border-t border-lme-border">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    Guardar Evaluación
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
