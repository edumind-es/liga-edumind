import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TipoDeporte } from '@/types/liga';

interface DeporteSelectorProps {
    selectedDeporte: TipoDeporte | null;
    onSelect: (deporte: TipoDeporte) => void;
}

export default function DeporteSelector({ selectedDeporte, onSelect }: DeporteSelectorProps) {
    const [deportes, setDeportes] = useState<TipoDeporte[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Auto-detect backend URL based on environment
        let apiUrl;
        if (import.meta.env.VITE_API_URL) {
            apiUrl = import.meta.env.VITE_API_URL;
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            apiUrl = 'http://localhost:8001/api/v1';
        } else {
            // Production: use proxied API path
            apiUrl = '/api/v1';
        }

        console.log('Using API URL:', apiUrl);

        fetch(`${apiUrl}/tipos-deporte/`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Asegurar que data es un array
                if (Array.isArray(data)) {
                    setDeportes(data);
                } else {
                    console.error('API did not return an array:', data);
                    setDeportes([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading sports:', err);
                setError('No se pudieron cargar los deportes. Verifica tu conexión.');
                setDeportes([]); // Asegurar que deportes es un array vacío
                setLoading(false);
            });
    }, []);

    const filteredDeportes = deportes.filter(d =>
        d.nombre.toLowerCase().includes(search.toLowerCase()) ||
        d.codigo.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="text-center py-12 text-sub">Cargando deportes...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-400 mb-4">{error}</div>
                <div className="text-sm text-sub">
                    Asegúrate de que el backend está funcionando en el puerto 8001.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sub" />
                <Input
                    type="text"
                    placeholder="Buscar deporte..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredDeportes.map((deporte) => (
                    <button
                        key={deporte.id}
                        onClick={() => onSelect(deporte)}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedDeporte?.id === deporte.id
                            ? 'border-mint bg-mint/10'
                            : 'border-paper/20 hover:border-sky/40'
                            }`}
                    >
                        <div className="text-4xl mb-2">{deporte.icono || '🏆'}</div>
                        <div className="text-sm font-medium text-ink text-center">
                            {deporte.nombre}
                        </div>
                        <div className="text-xs text-sub text-center mt-1">
                            {deporte.tipo_marcador}
                        </div>
                    </button>
                ))}
            </div>

            {filteredDeportes.length === 0 && (
                <div className="text-center py-8 text-sub">
                    No se encontraron deportes
                </div>
            )}
        </div>
    );
}
