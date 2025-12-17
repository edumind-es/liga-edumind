import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExpressMatch as ExpressMatchType } from '@/types/express';
import ScoreboardDisplay from './scoreboard/ScoreboardDisplay';
import { toast } from 'sonner';

export default function ExpressMatch() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<ExpressMatchType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!matchId) return;

        // Try to load from session storage
        const data = sessionStorage.getItem(`express_match_${matchId}`);

        if (data) {
            try {
                setMatch(JSON.parse(data));
            } catch (err) {
                console.error('Error parsing match data:', err);
                toast.error('Error al cargar el partido');
                navigate('/express');
            }
        } else {
            // Try to load from URL (shared match)
            const urlParams = new URLSearchParams(window.location.search);
            const sharedData = urlParams.get('d');

            if (sharedData) {
                try {
                    const decoded = JSON.parse(atob(sharedData));
                    setMatch(decoded);
                    // Save to session storage
                    sessionStorage.setItem(`express_match_${matchId}`, JSON.stringify(decoded));
                } catch (err) {
                    console.error('Error decoding shared match:', err);
                    toast.error('Enlace de partido inválido');
                    navigate('/express');
                }
            } else {
                toast.error('Partido no encontrado');
                navigate('/express');
            }
        }

        setLoading(false);
    }, [matchId, navigate]);

    const updateMarcador = (updates: Record<string, any>) => {
        if (!match) return;

        const updatedMatch = {
            ...match,
            marcador: { ...match.marcador, ...updates }
        };

        setMatch(updatedMatch);
        sessionStorage.setItem(`express_match_${match.id}`, JSON.stringify(updatedMatch));
    };

    const handleFinalizar = () => {
        if (!match) return;

        const finalMatch = { ...match, finalizado: true };
        setMatch(finalMatch);
        sessionStorage.setItem(`express_match_${match.id}`, JSON.stringify(finalMatch));

        navigate(`/express/acta/${match.id}`);
    };

    const handleCompartir = async () => {
        if (!match) return;

        try {
            // Encode match data to base64
            const encoded = btoa(JSON.stringify(match));
            const url = `${window.location.origin}/express/partido/${match.id}?d=${encoded}`;

            if (navigator.share) {
                await navigator.share({
                    title: `Partido: ${match.deporte.nombre}`,
                    text: `Comparte este partido en vivo`,
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Enlace copiado al portapapeles');
            }
        } catch (err) {
            console.error('Error sharing:', err);
            toast.error('Error al compartir');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#040614] via-[#0a0f24] to-[#040614] flex items-center justify-center">
                <div className="text-ink">Cargando partido...</div>
            </div>
        );
    }

    if (!match) {
        return null;
    }

    const localTeam = match.equipos.find(eq => eq.rol === 'local');
    const visitanteTeam = match.equipos.find(eq => eq.rol === 'visitante');

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#040614] via-[#0a0f24] to-[#040614] p-4">
            <div className="max-w-6xl mx-auto py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/express" className="inline-flex items-center text-sm text-sub hover:text-mint transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Volver
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleCompartir}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                    </Button>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">{match.deporte.icono}</div>
                    <h1 className="text-3xl font-bold text-ink mb-2">{match.deporte.nombre}</h1>
                    <p className="text-sub">
                        {new Date(match.fecha).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Teams Header */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card variant="glass">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm text-sub mb-1">Local</div>
                            <div className="text-xl font-bold text-ink">{localTeam?.nombre || 'Local'}</div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-center">
                        <div className="text-2xl font-bold text-sub">VS</div>
                    </div>

                    <Card variant="glass">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm text-sub mb-1">Visitante</div>
                            <div className="text-xl font-bold text-ink">{visitanteTeam?.nombre || 'Visitante'}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Scoreboard */}
                <Card variant="glass" className="mb-6">
                    <CardContent className="p-8">
                        <ScoreboardDisplay
                            tipo={match.deporte.tipo_marcador}
                            marcador={match.marcador}
                            config={match.deporte.config}
                            onUpdate={updateMarcador}
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleFinalizar}
                        className="bg-gradient-to-r from-mint to-sky px-8"
                    >
                        <Check className="h-5 w-5 mr-2" />
                        Finalizar Partido
                    </Button>
                </div>
            </div>
        </div>
    );
}
