import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { equiposApi } from '@/api/equipos';
import { ligasApi } from '@/api/ligas';
import { Liga, Equipo } from '@/types/liga';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ValuesRadarChart } from '@/components/charts/ValuesRadarChart';
import { PointsEvolutionChart } from '@/components/charts/PointsEvolutionChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function EquipoAnalytics() {
    const { ligaId, equipoId } = useParams<{ ligaId: string; equipoId: string }>();
    const [liga, setLiga] = useState<Liga | null>(null);
    const [equipo, setEquipo] = useState<Equipo | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ligaId && equipoId) {
            loadData(parseInt(ligaId), parseInt(equipoId));
        }
    }, [ligaId, equipoId]);

    const loadData = async (lId: number, eId: number) => {
        try {
            const [ligaData, equipoData, historyData, badgesData] = await Promise.all([
                ligasApi.getById(lId),
                equiposApi.getById(eId),
                equiposApi.getStatsHistory(eId),
                equiposApi.getBadges(eId)
            ]);
            setLiga(ligaData);
            setEquipo(equipoData);
            setHistory(historyData);
            setBadges(badgesData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-[300px]" />
                    <Skeleton className="h-[300px]" />
                </div>
            </div>
        );
    }

    if (!liga || !equipo) return <div>No encontrado</div>;

    // Prepare data for charts
    const radarData = [
        { subject: 'Juego Limpio', A: equipo.puntos_juego_limpio, fullMark: 150 },
        { subject: 'Árbitro', A: equipo.puntos_arbitro, fullMark: 150 },
        { subject: 'Grada', A: equipo.puntos_grada, fullMark: 150 },
    ];

    const barData = [
        {
            name: 'Total',
            deportivos: equipo.puntos_totales - equipo.puntos_juego_limpio - equipo.puntos_arbitro - equipo.puntos_grada, // Approximation if we don't have separate sports points in Equipo model, wait.
            // Equipo model has: puntos_totales, ganados, empatados, perdidos.
            // Sports points = (G*3) + (E*2) + (P*1).
            // Let's calculate it.
            educativos: equipo.puntos_juego_limpio + equipo.puntos_arbitro + equipo.puntos_grada
        }
    ];
    // Recalculate sports points correctly
    const sportsPoints = (equipo.ganados * 3) + (equipo.empatados * 2) + (equipo.perdidos * 1);
    barData[0].deportivos = sportsPoints;


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link to={`/ligas/${ligaId}/equipos`} className="inline-flex items-center text-sm text-lme-muted hover:text-lme-primary transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a equipos
                </Link>
            </div>

            <PageHeader
                title={`Analítica: ${equipo.nombre}`}
                description="Desglose de rendimiento deportivo y educativo"
                className="mb-8"
            />

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card variant="glass">
                    <CardHeader className="border-b border-lme-border bg-white/5">
                        <CardTitle>Perfil de Valores (MRPS)</CardTitle>
                        <CardDescription>Distribución de puntos educativos</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ValuesRadarChart data={radarData} />
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader className="border-b border-lme-border bg-white/5">
                        <CardTitle>Composición de Puntos</CardTitle>
                        <CardDescription>Deportivos vs Educativos</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <PointsEvolutionChart data={barData} />
                    </CardContent>
                </Card>
            </div>

            <div className="mb-8">
                <Card variant="glass">
                    <CardHeader className="border-b border-lme-border bg-white/5">
                        <CardTitle>Evolución de Valores</CardTitle>
                        <CardDescription>Tendencia a lo largo de las jornadas</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="jornada" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="juego_limpio" stroke="#16a34a" name="Juego Limpio" />
                                <Line type="monotone" dataKey="grada" stroke="#f59e0b" name="Grada" />
                                <Line type="monotone" dataKey="arbitraje" stroke="#2563eb" name="Arbitraje" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {badges.length > 0 && (
                <div className="mb-8">
                    <Card variant="glass" className="bg-gradient-to-r from-yellow-50/50 to-amber-50/50 border-amber-100">
                        <CardHeader className="border-b border-lme-border">
                            <CardTitle className="flex items-center gap-2">
                                <LucideIcons.Trophy className="h-6 w-6 text-yellow-600" />
                                Medallero del Equipo
                            </CardTitle>
                            <CardDescription>Reconocimientos obtenidos por rendimiento y valores</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {badges.map((badge) => {
                                    // Dynamic icon rendering
                                    const IconComponent = (LucideIcons as any)[badge.icon] || LucideIcons.Award;

                                    return (
                                        <div key={badge.id} className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 border border-white/40 shadow-sm hover:shadow-md transition-all">
                                            <div className={`p-3 rounded-full bg-white shadow-sm mb-3 ${badge.color}`}>
                                                <IconComponent className="h-8 w-8" />
                                            </div>
                                            <h4 className="font-bold text-ink mb-1">{badge.name}</h4>
                                            <p className="text-xs text-sub">{badge.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card variant="glass" className="bg-gradient-to-br from-white/80 to-white/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-lme-muted uppercase tracking-wider">Puntos Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-lme-text">{equipo.puntos_totales}</div>
                    </CardContent>
                </Card>
                <Card variant="glass" className="bg-gradient-to-br from-blue-50/80 to-blue-50/40 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600/70 uppercase tracking-wider">Puntos Deportivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-blue-600">{sportsPoints}</div>
                    </CardContent>
                </Card>
                <Card variant="glass" className="bg-gradient-to-br from-green-50/80 to-green-50/40 border-green-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600/70 uppercase tracking-wider">Puntos Educativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-green-600">{barData[0].educativos}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
