import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Edit2 } from 'lucide-react';
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
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
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

            // 2. Upload logo if selected
            if (logoFile) {
                await equiposApi.uploadLogo(parseInt(equipoId), logoFile);
            }

            toast.success('Equipo actualizado correctamente');
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
                            <Label htmlFor="logo" className="text-ink">Logo del equipo</Label>
                            <div className="flex items-center gap-6 p-6 bg-lme-surface-soft/50 rounded-xl border border-lme-border border-dashed">
                                <div className="shrink-0">
                                    {previewUrl ? (
                                        <div className="relative group">
                                            <img
                                                src={previewUrl}
                                                alt="Logo preview"
                                                className="h-24 w-24 rounded-full object-cover border-4 border-lme-surface shadow-glass"
                                            />
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <Edit2 className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-24 w-24 rounded-full bg-lme-surface-soft flex items-center justify-center text-sub border-2 border-dashed border-lme-border">
                                            <ImageIcon className="h-8 w-8 opacity-50" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="relative">
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden" // Hide default input
                                        />
                                        <Label
                                            htmlFor="logo"
                                            className="cursor-pointer inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-mint/10 text-mint hover:bg-mint/20 h-10 px-4 py-2 border border-mint/20"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            {logoFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
                                        </Label>
                                        <span className="ml-3 text-sm text-sub">
                                            {logoFile ? logoFile.name : 'Ningún archivo seleccionado'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-sub">
                                        Formatos soportados: PNG, JPG, GIF (Max. 5MB)
                                    </p>
                                </div>
                            </div>
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
