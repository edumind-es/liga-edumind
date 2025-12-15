import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ligasApi } from '../../api/ligas';
import { equiposApi } from '../../api/equipos';
import { jornadasApi } from '../../api/jornadas';
import { partidosApi } from '../../api/partidos';
import { tiposDeporteApi } from '../../api/tiposDeporte';
import { Liga, Equipo, JornadaWithStats, TipoDeporte } from '../../types/liga';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trophy, Users, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function CrearPartido() {
    const { ligaId } = useParams<{ ligaId: string }>();
    const navigate = useNavigate();

    const [liga, setLiga] = useState<Liga | null>(null);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [jornadas, setJornadas] = useState<JornadaWithStats[]>([]);
    const [deportes, setDeportes] = useState<TipoDeporte[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        tipo_deporte_id: '',
        jornada_id: '',
        equipo_local_id: '',
        equipo_visitante_id: '',
        arbitro_id: '',
        tutor_grada_local_id: '',
        tutor_grada_visitante_id: '',
        fecha_hora: ''
    });

    useEffect(() => {
        if (ligaId) {
            loadData(parseInt(ligaId));
        }
    }, [ligaId]);

    const loadData = async (id: number) => {
        try {
            const [ligaData, equiposData, jornadasData, deportesData] = await Promise.all([
                ligasApi.getById(id),
                equiposApi.getAllByLiga(id),
                jornadasApi.getAllByLiga(id),
                tiposDeporteApi.getAll()
            ]);
            setLiga(ligaData);
            setEquipos(equiposData);
            setJornadas(jornadasData);
            setDeportes(deportesData);
        } catch {
            setError('Error al cargar los datos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ligaId) return;

        // Validation
        if (!formData.tipo_deporte_id) {
            toast.error('Debes seleccionar un deporte');
            setError('Debes seleccionar un deporte');
            return;
        }

        if (!formData.equipo_local_id || !formData.equipo_visitante_id) {
            toast.error('Debes seleccionar ambos equipos (local y visitante)');
            setError('Debes seleccionar ambos equipos (local y visitante)');
            return;
        }

        // Validar que los 5 equipos sean diferentes
        const selectedTeams = [
            formData.equipo_local_id,
            formData.equipo_visitante_id,
            formData.arbitro_id,
            formData.tutor_grada_local_id,
            formData.tutor_grada_visitante_id
        ].filter(Boolean);

        if (new Set(selectedTeams).size !== selectedTeams.length) {
            toast.error('Todos los equipos deben ser diferentes');
            setError('Todos los equipos deben ser diferentes');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await partidosApi.create({
                liga_id: parseInt(ligaId),
                tipo_deporte_id: parseInt(formData.tipo_deporte_id),
                jornada_id: formData.jornada_id ? parseInt(formData.jornada_id) : undefined,
                equipo_local_id: parseInt(formData.equipo_local_id),
                equipo_visitante_id: parseInt(formData.equipo_visitante_id),
                arbitro_id: formData.arbitro_id ? parseInt(formData.arbitro_id) : undefined,
                tutor_grada_local_id: formData.tutor_grada_local_id ? parseInt(formData.tutor_grada_local_id) : undefined,
                tutor_grada_visitante_id: formData.tutor_grada_visitante_id ? parseInt(formData.tutor_grada_visitante_id) : undefined,
                fecha_hora: formData.fecha_hora ? new Date(formData.fecha_hora).toISOString() : undefined
            });
            toast.success('Partido creado correctamente');
            navigate(`/ligas/${ligaId}/partidos`);
        } catch {
            const errorMsg = 'Error al crear el partido';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-white">Cargando...</div>;
    if (!liga) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link to={`/ligas/${ligaId}/partidos`} className="inline-flex items-center text-sm text-lme-muted hover:text-lme-primary transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a Partidos
                </Link>
            </div>

            <PageHeader
                title="Nuevo Partido"
                description="Programa un nuevo encuentro para la liga"
                className="mb-8"
            />

            <Card variant="glass">
                <CardHeader className="border-b border-lme-border bg-white/5">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-lme-primary" />
                        Detalles del Encuentro
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-md">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Deporte</Label>
                                <Select
                                    value={formData.tipo_deporte_id}
                                    onValueChange={(value) => setFormData({ ...formData, tipo_deporte_id: value })}
                                >
                                    <SelectTrigger className="bg-white/50 border-lme-border text-gray-900 data-[placeholder]:text-gray-500 focus:ring-lme-primary">
                                        <SelectValue placeholder="Selecciona un deporte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deportes.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Jornada (Opcional)</Label>
                                <Select
                                    value={formData.jornada_id}
                                    onValueChange={(value) => setFormData({ ...formData, jornada_id: value })}
                                >
                                    <SelectTrigger className="bg-white/50 border-lme-border text-gray-900 data-[placeholder]:text-gray-500 focus:ring-lme-primary">
                                        <SelectValue placeholder="Sin jornada" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Sin jornada</SelectItem>
                                        {jornadas.map((j) => (
                                            <SelectItem key={j.id} value={j.id.toString()}>{j.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-white/40 p-6 rounded-xl border border-lme-border space-y-6">
                            <div className="flex items-center gap-2 mb-2 text-lme-primary font-semibold">
                                <Users className="h-5 w-5" />
                                <span>Encuentro</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Equipo Local</Label>
                                    <Select
                                        value={formData.equipo_local_id}
                                        onValueChange={(value) => setFormData({ ...formData, equipo_local_id: value })}
                                    >
                                        <SelectTrigger className="bg-white border-lme-border text-gray-900 data-[placeholder]:text-gray-500 focus:ring-lme-primary">
                                            <SelectValue placeholder="Selecciona equipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipos.map((e) => (
                                                <SelectItem
                                                    key={e.id}
                                                    value={e.id.toString()}
                                                    disabled={e.id.toString() === formData.equipo_visitante_id}
                                                >
                                                    {e.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Equipo Visitante</Label>
                                    <Select
                                        value={formData.equipo_visitante_id}
                                        onValueChange={(value) => setFormData({ ...formData, equipo_visitante_id: value })}
                                    >
                                        <SelectTrigger className="bg-white border-lme-border text-gray-900 data-[placeholder]:text-gray-500 focus:ring-lme-primary">
                                            <SelectValue placeholder="Selecciona equipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipos.map((e) => (
                                                <SelectItem
                                                    key={e.id}
                                                    value={e.id.toString()}
                                                    disabled={e.id.toString() === formData.equipo_local_id}
                                                >
                                                    {e.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Roles educativos */}
                        <div className="bg-amber-50/40 p-6 rounded-xl border border-amber-200 space-y-6">
                            <div className="flex items-center gap-2 mb-2 text-amber-700 font-semibold">
                                <Users className="h-5 w-5" />
                                <span>Roles Educativos (Opcionales)</span>
                            </div>
                            <p className="text-sm text-amber-600 mb-4">
                                Asigna equipos a roles educativos para fomentar valores deportivos
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Equipo Árbitro</Label>
                                    <Select
                                        value={formData.arbitro_id}
                                        onValueChange={(value) => setFormData({ ...formData, arbitro_id: value })}
                                    >
                                        <SelectTrigger className="bg-white border-amber-300 text-gray-900 data-[placeholder]:text-gray-500 focus:ring-amber-500">
                                            <SelectValue placeholder="Selecciona equipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Sin árbitro</SelectItem>
                                            {equipos.map((e) => (
                                                <SelectItem
                                                    key={e.id}
                                                    value={e.id.toString()}
                                                    disabled={[
                                                        formData.equipo_local_id,
                                                        formData.equipo_visitante_id,
                                                        formData.tutor_grada_local_id,
                                                        formData.tutor_grada_visitante_id
                                                    ].includes(e.id.toString())}
                                                >
                                                    {e.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Equipo Grada Local</Label>
                                    <Select
                                        value={formData.tutor_grada_local_id}
                                        onValueChange={(value) => setFormData({ ...formData, tutor_grada_local_id: value })}
                                    >
                                        <SelectTrigger className="bg-white border-amber-300 text-gray-900 data-[placeholder]:text-gray-500 focus:ring-amber-500">
                                            <SelectValue placeholder="Selecciona equipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Sin grada local</SelectItem>
                                            {equipos.map((e) => (
                                                <SelectItem
                                                    key={e.id}
                                                    value={e.id.toString()}
                                                    disabled={[
                                                        formData.equipo_local_id,
                                                        formData.equipo_visitante_id,
                                                        formData.arbitro_id,
                                                        formData.tutor_grada_visitante_id
                                                    ].includes(e.id.toString())}
                                                >
                                                    {e.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Equipo Grada Visitante</Label>
                                    <Select
                                        value={formData.tutor_grada_visitante_id}
                                        onValueChange={(value) => setFormData({ ...formData, tutor_grada_visitante_id: value })}
                                    >
                                        <SelectTrigger className="bg-white border-amber-300 text-gray-900 data-[placeholder]:text-gray-500 focus:ring-amber-500">
                                            <SelectValue placeholder="Selecciona equipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Sin grada visitante</SelectItem>
                                            {equipos.map((e) => (
                                                <SelectItem
                                                    key={e.id}
                                                    value={e.id.toString()}
                                                    disabled={[
                                                        formData.equipo_local_id,
                                                        formData.equipo_visitante_id,
                                                        formData.arbitro_id,
                                                        formData.tutor_grada_local_id
                                                    ].includes(e.id.toString())}
                                                >
                                                    {e.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha y Hora</Label>
                            <div className="relative">
                                <Input
                                    type="datetime-local"
                                    className="pl-10 bg-white/50 border-lme-border text-gray-900 focus:ring-lme-primary"
                                    value={formData.fecha_hora}
                                    onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                                />
                                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-lme-muted" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t border-lme-border">
                            <Link to={`/ligas/${ligaId}/partidos`}>
                                <Button variant="outline" type="button">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="min-w-[140px]"
                            >
                                {isLoading ? 'Creando...' : 'Crear Partido'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
