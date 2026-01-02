import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, X } from 'lucide-react';
import { equiposApi } from '@/api/equipos';
import { ligasApi } from '@/api/ligas';
import { Liga, Equipo } from '@/types/liga';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/url';

export default function EditarEquipo() {
    const { ligaId, equipoId } = useParams<{ ligaId: string; equipoId: string }>();
    const navigate = useNavigate();
    const [liga, setLiga] = useState<Liga | null>(null);
    const [equipo, setEquipo] = useState<Equipo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        nombre: '',
        color_principal: '#3B82F6'
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (ligaId && equipoId) {
            loadData(parseInt(ligaId), parseInt(equipoId));
        }
    }, [ligaId, equipoId]);

    const loadData = async (lId: number, eId: number) => {
        try {
            const [ligaData, equipoData] = await Promise.all([
                ligasApi.getById(lId),
                equiposApi.getById(eId)
            ]);
            setLiga(ligaData);
            setEquipo(equipoData);
            setFormData({
                nombre: equipoData.nombre,
                color_principal: equipoData.color_principal || '#3B82F6'
            });
            if (equipoData.logo_filename) {
                setPreviewUrl(getImageUrl(`/static/uploads/${equipoData.logo_filename}`));
            }
        } catch {
            toast.error('Error al cargar los datos');
            navigate(`/ligas/${lId}/equipos`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = async () => {
        if (!equipoId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || '/api/v1'}/equipos/${equipoId}/logo`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Error al eliminar logo');
            }

            setPreviewUrl(null);
            setLogoFile(null);
            toast.success('Logo eliminado correctamente');
        } catch {
            toast.error('Error al eliminar el logo');
        }
    };

    const handleCancelPreview = () => {
        setLogoFile(null);
        // Restore original logo if exists
        if (equipo?.logo_filename) {
            setPreviewUrl(getImageUrl(`/static/uploads/${equipo.logo_filename}`));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ligaId || !equipoId) return;

        setIsLoading(true);
        try {
            // 1. Update text data
            await equiposApi.update(parseInt(equipoId), {
                ...formData
            });

            // 2. Upload logo if new file selected
            if (logoFile) {
                try {
                    const formData = new FormData();
                    formData.append('file', logoFile);

                    const token = localStorage.getItem('token');
                    await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/equipos/${equipoId}/logo`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    toast.success('Equipo y logo actualizados correctamente');
                } catch {
                    toast.warning('Equipo actualizado, pero error al subir logo');
                }
            } else {
                toast.success('Equipo actualizado correctamente');
            }

            navigate(`/ligas/${ligaId}/equipos`);
        } catch {
            toast.error('Error al actualizar el equipo');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-sub">Cargando...</div>;
    if (!liga || !equipo) return <div className="p-8 text-center text-red-500">No encontrado</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="mb-6">
                <Link to={`/ligas/${ligaId}/equipos`} className="inline-flex items-center text-sm text-sub hover:text-mint transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Volver a equipos
                </Link>
            </div>

            <PageHeader
                title="Editar Equipo"
                description={`Modifica los datos de ${equipo.nombre}`}
                className="mb-8"
            />

            <Card variant="glass" className="overflow-hidden">
                <CardHeader className="border-b border-lme-border bg-white/5">
                    <CardTitle className="text-ink">Información del Equipo</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-ink">Nombre del equipo</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                                className="bg-lme-surface-soft border-lme-border text-ink focus-visible:ring-mint"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color" className="text-ink">Color principal</Label>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Input
                                        type="color"
                                        id="color"
                                        className="h-10 w-20 p-1 cursor-pointer bg-lme-surface-soft border-lme-border"
                                        value={formData.color_principal}
                                        onChange={(e) => setFormData({ ...formData, color_principal: e.target.value })}
                                    />
                                </div>
                                <span className="text-sm text-sub font-mono bg-lme-surface-soft px-3 py-2 rounded-md border border-lme-border">
                                    {formData.color_principal}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo" className="text-ink">Logo del equipo (opcional)</Label>

                            {previewUrl ? (
                                <div className="space-y-3">
                                    <div className="relative inline-block">
                                        <img
                                            src={previewUrl}
                                            alt="Logo del equipo"
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-lme-border shadow-lg"
                                        />
                                        {logoFile && (
                                            <button
                                                type="button"
                                                onClick={handleCancelPreview}
                                                className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600 transition-colors"
                                                title="Cancelar cambio"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label htmlFor="logo" className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 border border-lme-border rounded-lg hover:border-lme-primary hover:bg-lme-primary/5 transition-colors">
                                                <Upload className="h-4 w-4 text-lme-muted" />
                                                <span className="text-sm text-lme-muted">Cambiar logo</span>
                                            </div>
                                            <Input
                                                type="file"
                                                id="logo"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>

                                        {equipo?.logo_filename && !logoFile && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveLogo}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Eliminar logo
                                            </Button>
                                        )}
                                    </div>

                                    {logoFile && (
                                        <p className="text-xs text-green-600">
                                            ✓ Nuevo logo seleccionado: {logoFile.name}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <label htmlFor="logo" className="cursor-pointer">
                                        <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-lme-border rounded-lg hover:border-lme-primary hover:bg-lme-primary/5 transition-colors">
                                            <Upload className="h-5 w-5 text-lme-muted" />
                                            <span className="text-sm text-lme-muted">Seleccionar logo</span>
                                        </div>
                                        <Input
                                            type="file"
                                            id="logo"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <span className="text-xs text-lme-muted">JPG, PNG o WebP • Máx 5MB</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-lme-border">
                            <Button variant="ghost" className="text-sub hover:text-ink" asChild>
                                <Link to={`/ligas/${ligaId}/equipos`}>Cancelar</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="min-w-[140px] bg-gradient-to-r from-mint to-sky text-[#040614] hover:shadow-lg hover:shadow-mint/20 border-0"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
