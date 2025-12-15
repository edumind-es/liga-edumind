import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useLigas } from '@/hooks/useLigas';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Calendar, Users, Loader2, HelpCircle, Lightbulb, BookOpen } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuthStore();
    const { data: ligas, isLoading } = useLigas();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeader
                title={`Hola, ${user?.codigo}`}
                description="Gestiona tus ligas educativas, organiza calendarios y comparte las tarjetas de equipo con la estética LME."
            >
                <Link to="/ligas/crear">
                    <Button className="gap-2">
                        <Plus className="h-5 w-5" />
                        Crear nueva liga
                    </Button>
                </Link>
            </PageHeader>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-mint" />
                        <p className="text-sub text-sm">Cargando tus ligas...</p>
                    </div>
                </div>
            ) : ligas && ligas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ligas.map((liga) => (
                        <Card key={liga.id} variant="elevated" className="flex flex-col h-full">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardTitle className="text-lg font-bold mb-1 text-white">
                                            {liga.nombre}
                                        </CardTitle>
                                        <CardDescription>
                                            {liga.temporada || 'Temporada actual'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={liga.activa ? 'success' : 'secondary'}>
                                        {liga.activa ? 'Activa' : `ID ${liga.id}`}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 pb-5">
                                <p className="text-sm text-sub line-clamp-2">
                                    {liga.descripcion || 'Sin descripción'}
                                </p>
                            </CardContent>

                            <CardFooter className="gap-2 pt-0">
                                <Link to={`/ligas/${liga.id}`} className="flex-1">
                                    <Button className="w-full gap-2" variant="default">
                                        <Trophy className="h-4 w-4" />
                                        Gestionar
                                    </Button>
                                </Link>
                                <Link to={`/ligas/${liga.id}/jornadas`}>
                                    <Button variant="outline" size="icon" title="Calendario">
                                        <Calendar className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link to={`/ligas/${liga.id}/equipos`}>
                                    <Button variant="outline" size="icon" title="Equipos">
                                        <Users className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card variant="glass" className="text-center py-16">
                    <CardContent className="flex flex-col items-center max-w-md mx-auto">
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-mint/20 to-sky/20 mb-6">
                            <Trophy className="h-12 w-12 text-mint" />
                        </div>
                        <h3 className="text-2xl font-bold text-ink mb-3">
                            Empieza tu primera liga
                        </h3>
                        <p className="text-sub mb-8">
                            Diseña equipos, asigna roles y aplica la evaluación cooperativa con el modelo LME.
                        </p>
                        <Link to="/ligas/crear">
                            <Button size="lg" className="gap-2">
                                <Plus className="h-5 w-5" />
                                Crear liga ahora
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* FAQ Section */}
            <div className="grid gap-5 md:grid-cols-3 pt-6">
                <Card variant="glass">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-sky/20">
                                <HelpCircle className="h-4 w-4 text-sky" />
                            </div>
                            <CardTitle className="text-base">¿Qué puedo hacer aquí?</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-sub">
                            Ves todas tus ligas activas. Usa <strong className="text-ink">Gestionar</strong> para administrar equipos y jornadas.
                        </p>
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-mint/20">
                                <Lightbulb className="h-4 w-4 text-mint" />
                            </div>
                            <CardTitle className="text-base">¿Cómo creo una liga?</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-sub">
                            Pulsa <strong className="text-ink">Crear nueva liga</strong>. Solo necesitas un nombre para empezar.
                        </p>
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-vio/20">
                                <BookOpen className="h-4 w-4 text-vio" />
                            </div>
                            <CardTitle className="text-base">Consejo rápido</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-sub">
                            Proyecta esta vista para mostrar ligas en curso y acceder al marcador rápidamente.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
