import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { equiposApi } from '@/api/equipos';
import { ligasApi } from '@/api/ligas';
import { Liga } from '@/types/liga';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CrearEquipo() {
    const { ligaId } = useParams<{ ligaId: string }>();
    const navigate = useNavigate();
    const [liga, setLiga] = useState<Liga | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        color_principal: '#3B82F6'
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (ligaId) {
            ligasApi.getById(parseInt(ligaId)).then(setLiga).catch(() => setError('Liga no encontrada'));
        }
    }, [ligaId]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no puede superar 5MB');
            return;
        }

        setLogoFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ligaId) return;

        // Client-side validation
        if (!formData.nombre.trim()) {
            setError('El nombre del equipo es obligatorio');
            toast.error('El nombre del equipo es obligatorio');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const equipo = await equiposApi.create({
                ...formData,
                liga_id: parseInt(ligaId)
            });

            // Upload logo if provided
            if (logoFile && equipo.id) {
                try {
                    const formData = new FormData();
                    formData.append('file', logoFile);

                    const token = localStorage.getItem('token');
                    await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/equipos/${equipo.id}/logo`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    toast.success('Equipo y logo creados correctamente');
                } catch {
                    toast.warning('Equipo creado, pero error al subir logo');
                }
            } else {
                toast.success('Equipo creado correctamente');
            }

            navigate(`/ligas/${ligaId}/equipos`);
        } catch {
            const errorMsg = 'Error al crear el equipo';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!liga) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link to={`/ligas/${ligaId}/equipos`} className="inline-flex items-center text-sm text-lme-muted hover:text-lme-primary transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a equipos
                </Link>
            </div>

            <PageHeader
                title="Nuevo Equipo"
                description={`Añade un equipo a ${liga.nombre}`}
                className="mb-8"
            />

            <Card variant="glass">
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 pt-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre del equipo *</Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                required
                                placeholder="Ej: Los Leones"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color principal</Label>
                            <div className="flex items-center space-x-3">
                                <Input
                                    type="color"
                                    id="color"
                                    name="color_principal"
                                    className="h-10 w-20 p-1 cursor-pointer"
                                    value={formData.color_principal}
                                    onChange={(e) => setFormData({ ...formData, color_principal: e.target.value })}
                                />
                                <span className="text-sm text-lme-muted font-mono bg-white/50 px-2 py-1 rounded border border-lme-border">
                                    {formData.color_principal}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo del equipo (opcional)</Label>

                            {logoPreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={logoPreview}
                                        alt="Preview logo"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-lme-border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <label htmlFor="logo" className="cursor-pointer">
                                        <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-lme-border rounded-lg hover:border-lme-primary hover:bg-lme-primary/5 transition-colors">
                                            <Upload className="h-5 w-5 text-lme-muted" />
                                            <span className="text-sm text-lme-muted">Seleccionar imagen</span>
                                        </div>
                                        <Input
                                            type="file"
                                            id="logo"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                    </label>
                                    <span className="text-xs text-lme-muted">JPG, PNG o WebP • Máx 5MB</span>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <div className="flex justify-end space-x-3 p-6 pt-0">
                        <Link to={`/ligas/${ligaId}/equipos`}>
                            <Button variant="outline" type="button">
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? 'Creando...' : 'Crear Equipo'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
