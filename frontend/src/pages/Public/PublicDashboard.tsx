import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicApi } from '@/api/public';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar } from 'lucide-react';
import { Liga, ClasificacionItem } from '@/types/liga';
import { PageHeader } from '@/components/layout/PageHeader';

interface PartidoPublic {
    id: number;
    equipo_local_id: number;
    equipo_visitante_id: number;
    puntos_local: number;
    puntos_visitante: number;
    finalizado: boolean;
}

interface JornadaPublic {
    id: number;
    nombre: string;
    fecha_inicio: string;
    partidos: PartidoPublic[];
}

export default function PublicDashboard() {
    const { ligaId } = useParams<{ ligaId: string }>();
    const navigate = useNavigate();
    const [liga, setLiga] = useState<Liga | null>(null);
    const [clasificacion, setClasificacion] = useState<ClasificacionItem[]>([]);
    const [jornadas, setJornadas] = useState<JornadaPublic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ligaId) {
            loadData(parseInt(ligaId));
        }
    }, [ligaId]);

    const loadData = async (id: number) => {
        const token = localStorage.getItem(`public_token_${id}`);
        if (!token) {
            navigate(`/public/${id}/login`);
            return;
        }

        try {
            const [ligaData, clasData, jornadasData] = await Promise.all([
                publicApi.getLiga(id, token),
                publicApi.getClasificacion(id, token),
                publicApi.getJornadas(id, token)
            ]);
            setLiga(ligaData);
            setClasificacion(clasData.clasificacion);
            setJornadas(jornadasData);
        } catch {
            // Token invalid or expired
            localStorage.removeItem(`public_token_${id}`);
            navigate(`/public/${id}/login`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <Skeleton className="h-12 w-64 mx-auto" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!liga) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-lme-bg-start to-lme-bg-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title={liga.nombre}
                    description={`${liga.temporada} ${liga.descripcion ? `· ${liga.descripcion}` : ''}`}
                    className="text-center md:text-center items-center justify-center mb-12"
                />

                <Tabs defaultValue="clasificacion" className="space-y-8">
                    <div className="flex justify-center">
                        <TabsList className="bg-white/20 backdrop-blur-md border border-white/20 p-1 rounded-full">
                            <TabsTrigger value="clasificacion" className="rounded-full px-6 data-[state=active]:bg-lme-primary data-[state=active]:text-white">
                                <Trophy className="h-4 w-4 mr-2" />
                                Clasificación
                            </TabsTrigger>
                            <TabsTrigger value="jornadas" className="rounded-full px-6 data-[state=active]:bg-lme-primary data-[state=active]:text-white">
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendario
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="clasificacion" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card variant="glass" className="overflow-hidden">
                            <CardHeader className="bg-white/10 border-b border-white/10">
                                <CardTitle>Tabla de Clasificación</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-white/5 border-white/10">
                                                <TableHead className="w-[60px] text-center font-bold text-lme-text">Pos</TableHead>
                                                <TableHead className="font-bold text-lme-text">Equipo</TableHead>
                                                <TableHead className="text-center font-bold text-lme-text">PJ</TableHead>
                                                <TableHead className="text-center font-bold text-lme-text">G</TableHead>
                                                <TableHead className="text-center font-bold text-lme-text">E</TableHead>
                                                <TableHead className="text-center font-bold text-lme-text">P</TableHead>
                                                <TableHead className="text-center font-bold text-blue-600 bg-blue-50/50">Dep</TableHead>
                                                <TableHead className="text-center font-bold text-green-600 bg-green-50/50">Edu</TableHead>
                                                <TableHead className="text-center font-black text-lg text-lme-primary bg-lme-primary/5">TOTAL</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {clasificacion.map((equipo) => (
                                                <TableRow key={equipo.equipo_id} className="hover:bg-white/10 border-white/10 transition-colors">
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="jornadas" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {jornadas.map((jornada) => (
                                <Card key={jornada.id} variant="glass" className="hover:scale-[1.02] transition-transform duration-300">
                                    <CardHeader className="pb-3 border-b border-white/10">
                                        <CardTitle className="text-lg flex justify-between items-center">
                                            <span className="text-lme-primary">{jornada.nombre}</span>
                                            <Badge variant="outline" className="bg-white/20 backdrop-blur-sm border-white/20">
                                                {jornada.fecha_inicio ? new Date(jornada.fecha_inicio).toLocaleDateString() : 'TBD'}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="space-y-3">
                                            {jornada.partidos.length === 0 ? (
                                                <p className="text-sm text-lme-muted italic text-center py-4">No hay partidos programados.</p>
                                            ) : (
                                                jornada.partidos.map((partido) => (
                                                    <div key={partido.id} className="flex items-center justify-between p-3 bg-white/30 rounded-xl border border-white/20 shadow-sm">
                                                        <div className="flex-1 text-right font-medium text-sm text-lme-text truncate pr-2">
                                                            Equipo {partido.equipo_local_id}
                                                        </div>
                                                        <div className="px-3 py-1 bg-white/80 rounded-lg font-bold text-xs min-w-[60px] text-center shadow-inner text-lme-primary-dark">
                                                            {partido.finalizado ? (
                                                                `${partido.puntos_local} - ${partido.puntos_visitante}`
                                                            ) : (
                                                                'VS'
                                                            )}
                                                        </div>
                                                        <div className="flex-1 text-left font-medium text-sm text-lme-text truncate pl-2">
                                                            Equipo {partido.equipo_visitante_id}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
