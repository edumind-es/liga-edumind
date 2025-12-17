import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { ligasApi } from '@/api/ligas';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CrearLiga() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        temporada: '',
        modo_competicion: 'unico_deporte' as 'unico_deporte' | 'multi_deporte'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        if (!formData.nombre.trim()) {
            setError('El nombre de la liga es obligatorio');
            toast.error('El nombre de la liga es obligatorio');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const newLiga = await ligasApi.create(formData);
            toast.success('Liga creada correctamente');
            navigate(`/ligas/${newLiga.id}`);
        } catch (err) {
            const errorMsg = 'Error al crear la liga. Inténtalo de nuevo.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <Link to="/ligas" className="inline-flex items-center text-sm text-sub hover:text-mint mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Volver a mis ligas
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-mint to-sky">
                        <Trophy className="h-6 w-6 text-[#040614]" />
                    </div>
                    <PageHeader
                        title="Nueva Liga"
                        description="Crea una nueva competición escolar"
                        className="mb-0"
                    />
                </div>
            </div>

            <Card variant="glass">
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 pt-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-ink">Nombre de la liga *</Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                required
                                placeholder="Ej: Liga Valores 6º Primaria"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="temporada" className="text-ink">Temporada (opcional)</Label>
                            <Input
                                id="temporada"
                                name="temporada"
                                placeholder="Ej: 2024-2025"
                                value={formData.temporada}
                                onChange={(e) => setFormData({ ...formData, temporada: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-ink">Modo de Competición</Label>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 p-4 rounded-lg border border-paper/20 hover:border-mint/40 cursor-pointer transition-all group">
                                    <input
                                        type="radio"
                                        name="modo_competicion"
                                        value="unico_deporte"
                                        checked={formData.modo_competicion === 'unico_deporte'}
                                        onChange={(e) => setFormData({ ...formData, modo_competicion: e.target.value as 'unico_deporte' | 'multi_deporte' })}
                                        className="mt-1 text-mint focus:ring-mint"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-ink group-hover:text-mint transition-colors">Liga de un solo deporte (Round Robin)</div>
                                        <p className="text-sm text-sub mt-1">
                                            Sistema tradicional. Cada equipo juega contra todos los demás una vez por ronda.
                                            Con 6 equipos: 3 partidos por jornada.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 rounded-lg border border-paper/20 hover:border-sky/40 cursor-pointer transition-all group">
                                    <input
                                        type="radio"
                                        name="modo_competicion"
                                        value="multi_deporte"
                                        checked={formData.modo_competicion === 'multi_deporte'}
                                        onChange={(e) => setFormData({ ...formData, modo_competicion: e.target.value as 'unico_deporte' | 'multi_deporte' })}
                                        className="mt-1 text-sky focus:ring-sky"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-ink group-hover:text-sky transition-colors">Liga multi-deporte (Todas las combinaciones)</div>
                                        <p className="text-sm text-sub mt-1">
                                            Ideal para jornadas por deporte. Genera TODOS los enfrentamientos posibles.
                                            Con 5 equipos: 10 partidos por jornada.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descripcion" className="text-ink">Descripción (opcional)</Label>
                            <Textarea
                                id="descripcion"
                                name="descripcion"
                                rows={4}
                                placeholder="Breve descripción de la liga..."
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                    </CardContent>

                    <div className="flex justify-end space-x-3 p-6 pt-0">
                        <Link to="/ligas">
                            <Button variant="outline" type="button">
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[140px]"
                        >
                            {isLoading ? 'Creando...' : 'Crear Liga'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
