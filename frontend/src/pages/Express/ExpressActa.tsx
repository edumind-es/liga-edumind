import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ExpressMatch } from '@/types/express';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ExpressActa() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<ExpressMatch | null>(null);
    const [evaluaciones, setEvaluaciones] = useState({
        juego_limpio: { local: 5, visitante: 5 },
        arbitro: { conocimiento: 5, gestion: 5, apoyo: 5 },
        grada: {
            local: { animar: 5, respeto: 5, participacion: 5 },
            visitante: { animar: 5, respeto: 5, participacion: 5 }
        }
    });
    const actaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!matchId) return;

        const data = sessionStorage.getItem(`express_match_${matchId}`);
        if (data) {
            const parsedMatch = JSON.parse(data);
            setMatch(parsedMatch);
            if (parsedMatch.evaluaciones) {
                setEvaluaciones({ ...evaluaciones, ...parsedMatch.evaluaciones });
            }
        } else {
            toast.error('Partido no encontrado');
            navigate('/express');
        }
    }, [matchId, navigate]);

    const updateEvaluacion = (path: string[], value: number) => {
        const newEval = { ...evaluaciones };
        let current: any = newEval;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;

        setEvaluaciones(newEval);

        if (match) {
            const updatedMatch = { ...match, evaluaciones: newEval };
            sessionStorage.setItem(`express_match_${matchId}`, JSON.stringify(updatedMatch));
        }
    };

    const exportPDF = async () => {
        if (!actaRef.current || !match) return;

        try {
            toast.loading('Generando PDF...');

            const canvas = await html2canvas(actaRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210; // A4 width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`acta_partido_${match.deporte.codigo}_${new Date().toLocaleDateString()}.pdf`);

            toast.dismiss();
            toast.success('PDF descargado correctamente');
        } catch (err) {
            console.error('Error generating PDF:', err);
            toast.dismiss();
            toast.error('Error al generar PDF');
        }
    };

    const handleCompartir = async () => {
        if (!match) return;

        try {
            const encoded = btoa(JSON.stringify(match));
            const url = `${window.location.origin}/express/partido/${match.id}?d=${encoded}`;

            if (navigator.share) {
                await navigator.share({
                    title: `Acta: ${match.deporte.nombre}`,
                    text: `Resultado final del partido`,
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Enlace copiado');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    if (!match) {
        return null;
    }

    const localTeam = match.equipos.find(eq => eq.rol === 'local');
    const visitanteTeam = match.equipos.find(eq => eq.rol === 'visitante');
    const arbitroTeam = match.equipos.find(eq => eq.rol === 'arbitro');

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#040614] via-[#0a0f24] to-[#040614] p-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/express" className="inline-flex items-center text-sm text-sub hover:text-mint transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Nueva partida
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCompartir}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartir
                        </Button>
                        <Button size="sm" onClick={exportPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                        </Button>
                    </div>
                </div>

                {/* Acta Content */}
                <div ref={actaRef} className="bg-white p-8 rounded-lg" style={{ minHeight: '297mm' }}>
                    {/* Header */}
                    <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
                        <div className="text-5xl mb-3">{match.deporte.icono}</div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Acta de Partido</h1>
                        <h2 className="text-xl text-gray-700">{match.deporte.nombre}</h2>
                        <p className="text-sm text-gray-500 mt-2">
                            {new Date(match.fecha).toLocaleString('es-ES')}
                        </p>
                    </div>

                    {/* Equipos */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Equipos Participantes</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {match.equipos.map((equipo) => (
                                <div key={equipo.id} className="p-3 border border-gray-200 rounded">
                                    <div className="font-medium text-gray-900">{equipo.nombre}</div>
                                    <div className="text-sm text-gray-500 capitalize">{equipo.rol.replace('_', ' ')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marcador */}
                    <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Resultado Final</h3>
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">{localTeam?.nombre}</div>
                                <div className="text-4xl font-bold text-gray-900">
                                    {getMarcadorValue(match.marcador, 'local')}
                                </div>
                            </div>
                            <div className="text-center text-2xl font-bold text-gray-400">-</div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">{visitanteTeam?.nombre}</div>
                                <div className="text-4xl font-bold text-gray-900">
                                    {getMarcadorValue(match.marcador, 'visitante')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Evaluaciones */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluaciones Educativas</h3>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Juego Limpio</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600">{localTeam?.nombre}</div>
                                        <div className="text-2xl font-bold text-gray-900">{evaluaciones.juego_limpio.local}/10</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">{visitanteTeam?.nombre}</div>
                                        <div className="text-2xl font-bold text-gray-900">{evaluaciones.juego_limpio.visitante}/10</div>
                                    </div>
                                </div>
                            </div>

                            {arbitroTeam && (
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">Árbitro: {arbitroTeam.nombre}</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Conocimiento</div>
                                            <div className="font-semibold">{evaluaciones.arbitro.conocimiento}/10</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Gestión</div>
                                            <div className="font-semibold">{evaluaciones.arbitro.gestion}/10</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Apoyo</div>
                                            <div className="font-semibold">{evaluaciones.arbitro.apoyo}/10</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                        <p>Liga EDUmind - Marcador Express</p>
                        <p className="mt-1">Generado el {new Date().toLocaleString('es-ES')}</p>
                    </div>
                </div>

                {/* Evaluation Form (not in PDF) */}
                <Card variant="glass" className="mt-6">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-ink mb-4">Ajustar Evaluaciones</h3>

                        <div className="space-y-6">
                            {/* Juego Limpio */}
                            <div>
                                <Label className="text-ink mb-3 block">Juego Limpio</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-sub">{localTeam?.nombre}</Label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            value={evaluaciones.juego_limpio.local}
                                            onChange={(e) => updateEvaluacion(['juego_limpio', 'local'], parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                        <div className="text-center text-mint font-bold">{evaluaciones.juego_limpio.local}/10</div>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-sub">{visitanteTeam?.nombre}</Label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            value={evaluaciones.juego_limpio.visitante}
                                            onChange={(e) => updateEvaluacion(['juego_limpio', 'visitante'], parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                        <div className="text-center text-sky font-bold">{evaluaciones.juego_limpio.visitante}/10</div>
                                    </div>
                                </div>
                            </div>

                            {/* Árbitro */}
                            {arbitroTeam && (
                                <div>
                                    <Label className="text-ink mb-3 block">Árbitro: {arbitroTeam.nombre}</Label>
                                    <div className="space-y-3">
                                        {['conocimiento', 'gestion', 'apoyo'].map((criteria) => (
                                            <div key={criteria}>
                                                <Label className="text-sm text-sub capitalize">{criteria}</Label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={(evaluaciones.arbitro as any)[criteria]}
                                                    onChange={(e) => updateEvaluacion(['arbitro', criteria], parseInt(e.target.value))}
                                                    className="w-full"
                                                />
                                                <div className="text-center text-ink font-bold">{(evaluaciones.arbitro as any)[criteria]}/10</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function getMarcadorValue(marcador: Record<string, any>, team: 'local' | 'visitante'): string | number {
    // Try different marcador types
    if (marcador[`goles_${team}`] !== undefined) return marcador[`goles_${team}`];
    if (marcador[`puntos_${team}`] !== undefined) return marcador[`puntos_${team}`];
    if (marcador[`sets_${team}`] !== undefined) return marcador[`sets_${team}`];
    if (marcador[`tries_${team}`] !== undefined) return marcador[`tries_${team}`];
    if (marcador[`carreras_${team}`] !== undefined) return marcador[`carreras_${team}`];
    return 0;
}
