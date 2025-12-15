import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, Calendar, Trophy, Info, Key, Copy, Eye, Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ligasApi } from '@/api/ligas';
import { useLiga } from '@/hooks/useLigas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ConfiguracionLiga() {
    const { id } = useParams<{ id: string }>();
    const ligaId = id ? parseInt(id) : 0;
    const { data: liga, isLoading } = useLiga(ligaId);
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);

    const [publicPin, setPublicPin] = useState('');

    useEffect(() => {
        if (liga) {
            setPublicPin(liga.public_pin || '');
        }
    }, [liga]);

    const handleGeneratePin = async () => {
        if (!liga) return;
        setIsUpdating(true);
        try {
            const res = await ligasApi.generatePublicPin(ligaId);
            setPublicPin(res.public_pin);
            await queryClient.invalidateQueries({ queryKey: ['ligas', ligaId] });
            toast.success('PIN generado correctamente');
        } catch {
            toast.error('No se pudo generar el PIN');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDisablePin = async () => {
        if (!liga) return;
        setIsUpdating(true);
        try {
            await ligasApi.disablePublicPin(ligaId);
            setPublicPin('');
            await queryClient.invalidateQueries({ queryKey: ['ligas', ligaId] });
            toast.success('Acceso por PIN desactivado');
        } catch {
            toast.error('No se pudo desactivar el PIN');
        } finally {
            setIsUpdating(false);
        }
    };

    const copyToClipboard = () => {
        const url = `${window.location.origin}/public/${ligaId}/login`;
        navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles');
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!liga) {
        return <div className="p-8 text-center text-red-500">Liga no encontrada</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600">
                    <Link to={`/ligas/${liga.id}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a la liga
                    </Link>
                </Button>

                <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Configuración de Liga
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Gestiona las opciones y configuraciones de {liga.nombre}
                </p>
            </div>

            <div className="grid gap-6">
                {/* Accesos Alumnos Section */}
                <Card className="border-indigo-200 bg-indigo-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                            <Lock className="h-5 w-5" />
                            Acceso para Alumnos
                        </CardTitle>
                        <CardDescription>
                            Configura el PIN y comparte el enlace para que los alumnos puedan ver clasificaciones y gestionar partidos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="pin">PIN de Acceso (6 caracteres)</Label>
	                                <div className="flex gap-2">
	                                    <div className="relative flex-1">
	                                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
		                                        <Input
		                                            id="pin"
		                                            value={publicPin}
		                                            readOnly
		                                            placeholder="Genera un PIN"
		                                            className="pl-9 bg-white font-mono text-gray-900 placeholder:text-gray-500"
		                                        />
	                                    </div>
	                                    <Button
	                                        onClick={handleGeneratePin}
	                                        disabled={isUpdating}
	                                    >
	                                        {isUpdating ? 'Generando...' : publicPin ? 'Regenerar PIN' : 'Generar PIN'}
	                                    </Button>
	                                </div>
	                                <div className="flex gap-2">
	                                    <Button
	                                        variant="outline"
	                                        onClick={handleDisablePin}
	                                        disabled={isUpdating || !publicPin}
	                                    >
	                                        Desactivar
	                                    </Button>
	                                </div>
	                                <p className="text-xs text-muted-foreground">
	                                    Este PIN es necesario para acceder a la vista de alumnos.
	                                </p>
	                            </div>

                            <div className="space-y-2">
                                <Label>Enlace de Acceso Público</Label>
                                <div className="flex gap-2">
	                                    <code className="flex-1 rounded bg-slate-950 px-4 py-2 text-sm font-mono text-white flex items-center overflow-x-auto">
	                                        {window.location.origin}/public/{ligaId}/login
	                                    </code>
	                                    <Button
	                                        variant="outline"
	                                        size="icon"
	                                        onClick={copyToClipboard}
	                                        title="Copiar enlace"
	                                        disabled={!publicPin}
	                                    >
	                                        <Copy className="h-4 w-4" />
	                                    </Button>
	                                    <Button variant="outline" size="icon" asChild title="Ver vista de alumnos" disabled={!publicPin}>
	                                        <Link to={`/public/${ligaId}/login`} target="_blank">
	                                            <Eye className="h-4 w-4" />
	                                        </Link>
	                                    </Button>
	                                </div>
	                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Información General */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Información General
                        </CardTitle>
                        <CardDescription>
                            Detalles básicos de la liga
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Nombre de la Liga</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{liga.nombre}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
                            <p className="text-gray-900 mt-1">
                                {liga.created_at ? new Date(liga.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Gestión de Calendario */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Generación de Calendario
                        </CardTitle>
                        <CardDescription>
                            Configura cómo se generan los partidos automáticamente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-blue-900">Sistema de 5 Equipos por Partido</strong>
                                    <p className="mt-2 text-sm text-blue-800">
                                        Los partidos generados automáticamente asignan roles a 5 equipos diferentes:
                                    </p>
                                    <ul className="mt-2 ml-4 space-y-1 text-sm list-disc text-blue-800">
                                        <li><strong>Equipo Local</strong>: Juega en casa</li>
                                        <li><strong>Equipo Visitante</strong>: Juega fuera</li>
                                        <li><strong>Equipo Árbitro</strong>: Arbitra el encuentro</li>
                                        <li><strong>Equipo Grada Local</strong>: Anima desde la grada local</li>
                                        <li><strong>Equipo Grada Visitante</strong>: Anima desde la grada visitante</li>
                                    </ul>
                                    <p className="mt-3 text-sm text-blue-800">
                                        El sistema usa un algoritmo <strong>Round Robin</strong> que rota a los equipos
                                        por todos los roles de forma equitativa, asegurando que todos tengan las mismas
                                        oportunidades de sumar puntos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <Button asChild>
                                <Link to={`/ligas/${liga.id}/jornadas`}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Ir a Jornadas
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sistema de Puntuación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Sistema de Puntuación
                        </CardTitle>
                        <CardDescription>
                            Cómo se asignan los puntos en los partidos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Puntos Deportivos</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    <li>• Victoria: <strong>3 puntos</strong></li>
                                    <li>• Empate: <strong>2 puntos</strong></li>
                                    <li>• Derrota: <strong>1 punto</strong></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Puntos Educativos (MRPS)</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    <li>• Juego Limpio: hasta <strong>1 punto</strong></li>
                                    <li>• Arbitraje: hasta <strong>1 punto</strong> (media ≥5)</li>
                                    <li>• Grada: puntos según evaluación (0-10)</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requisitos */}
                <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader>
                        <CardTitle className="text-amber-900">Requisitos Importantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border border-amber-300 bg-amber-50 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-amber-900">
                                    <strong>Para generar calendarios automáticos:</strong>
                                    <ul className="mt-2 ml-4 space-y-1 text-sm list-disc">
                                        <li>Se requieren <strong>mínimo 5 equipos</strong> en la liga</li>
                                        <li>Los equipos deben estar creados antes de generar el calendario</li>
                                        <li>Cada partido necesita 5 equipos diferentes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
