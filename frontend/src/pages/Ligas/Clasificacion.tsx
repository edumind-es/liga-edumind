import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Medal, Users, UserCheck, Trophy } from 'lucide-react';
import { useClasificacion } from '@/hooks/useLigas';
import { useLiga } from '@/hooks/useLigas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ClasificacionItem } from '@/types/liga';
import EmptyState from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function Clasificacion() {
    const { id } = useParams<{ id: string }>();
    const ligaId = id ? parseInt(id) : 0;

    const { data: liga, isLoading: isLoadingLiga } = useLiga(ligaId);
    const { data: clasificacionData, isLoading: isLoadingClasificacion } = useClasificacion(ligaId);

    if (isLoadingLiga || isLoadingClasificacion) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!liga) return <div className="p-8 text-center text-red-500">Liga no encontrada</div>;

    const clasificacion = clasificacionData?.clasificacion || [];

    return (
        <div className="space-y-6">
            <Breadcrumb items={[
                { label: 'Mis Ligas', href: '/ligas' },
                { label: liga.nombre, href: `/ligas/${liga.id}` },
                { label: 'Clasificación' }
            ]} />

            <PageHeader
                title="Clasificación"
                description="Puntos deportivos + Valores educativos (Juego Limpio, Árbitro, Grada)"
                className="mb-8"
            >
                <Link to={`/ligas/${liga.id}`}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a la liga
                    </Button>
                </Link>
            </PageHeader>

            <Card variant="glass">
                <CardHeader className="border-b border-lme-border bg-white/5">
                    <CardTitle>Tabla General</CardTitle>
                    <CardDescription>Sistema de puntuación EDUmind</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {clasificacion.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={Trophy}
                                title="No hay datos de clasificación"
                                description="Crea equipos y partidos para que aparezcan los resultados en la tabla de clasificación."
                                actionLabel="Ver equipos"
                                actionHref={`/ligas/${liga.id}/equipos`}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-white/5 border-lme-border">
                                        <TableHead className="w-[60px] text-center font-bold text-lme-text">Pos</TableHead>
                                        <TableHead className="font-bold text-lme-text">Equipo</TableHead>
                                        <TableHead className="text-center font-bold text-lme-text">PJ</TableHead>
                                        <TableHead className="text-center font-bold text-lme-text">G</TableHead>
                                        <TableHead className="text-center font-bold text-lme-text">E</TableHead>
                                        <TableHead className="text-center font-bold text-lme-text">P</TableHead>
                                        <TableHead className="text-center font-bold text-blue-600 bg-blue-50/50">Pts Dep</TableHead>
                                        <TableHead className="text-center hidden md:table-cell">
                                            <div className="flex items-center justify-center gap-1 text-lme-muted" title="Juego Limpio">
                                                <Medal className="h-4 w-4" /> JL
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center hidden md:table-cell">
                                            <div className="flex items-center justify-center gap-1 text-lme-muted" title="Respeto Árbitro">
                                                <UserCheck className="h-4 w-4" /> Arb
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center hidden md:table-cell">
                                            <div className="flex items-center justify-center gap-1 text-lme-muted" title="Comportamiento Grada">
                                                <Users className="h-4 w-4" /> Grd
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-green-600 bg-green-50/50">Pts Edu</TableHead>
                                        <TableHead className="text-center font-black text-lg text-lme-primary bg-lme-primary/5">TOTAL</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clasificacion.map((equipo: ClasificacionItem, index: number) => (
                                        <TableRow
                                            key={equipo.equipo_id}
                                            className={`transition-colors hover:bg-white/10 border-lme-border ${index % 2 === 1 ? 'bg-white/5' : ''}`}
                                        >
                                            <TableCell className="font-medium text-center">
                                                <div className={`
                                                    w-8 h-8 flex items-center justify-center rounded-full font-bold mx-auto
                                                    ${equipo.posicion === 1 ? 'bg-yellow-100 text-yellow-700 shadow-sm' :
                                                        equipo.posicion === 2 ? 'bg-gray-100 text-gray-700 shadow-sm' :
                                                            equipo.posicion === 3 ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-lme-muted'}
                                                `}>
                                                    {equipo.posicion}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-lme-text">{equipo.equipo_nombre}</TableCell>
                                            <TableCell className="text-center text-lme-muted">{equipo.partidos_jugados}</TableCell>
                                            <TableCell className="text-center text-green-600 font-medium">{equipo.ganados}</TableCell>
                                            <TableCell className="text-center text-yellow-600 font-medium">{equipo.empatados}</TableCell>
                                            <TableCell className="text-center text-red-600 font-medium">{equipo.perdidos}</TableCell>
                                            <TableCell className="text-center font-bold text-blue-600 bg-blue-50/30">
                                                {equipo.puntos_deportivos}
                                            </TableCell>
                                            <TableCell className="text-center hidden md:table-cell text-lme-muted">
                                                {equipo.puntos_juego_limpio}
                                            </TableCell>
                                            <TableCell className="text-center hidden md:table-cell text-lme-muted">
                                                {equipo.puntos_arbitro}
                                            </TableCell>
                                            <TableCell className="text-center hidden md:table-cell text-lme-muted">
                                                {equipo.puntos_grada}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-green-600 bg-green-50/30">
                                                {equipo.puntos_educativos_total}
                                            </TableCell>
                                            <TableCell className="text-center font-black text-lg text-lme-primary bg-lme-primary/5">
                                                {equipo.puntos_totales}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
