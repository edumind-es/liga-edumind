import { useEffect, useRef } from 'react';
import { User, Users, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Equipo, TipoDeporte, Marcador } from '@/types/liga';
import { getImageUrl } from '@/utils/url';

interface ScoreboardProps {
    equipoLocal: Equipo;
    equipoVisitante: Equipo;
    marcador: Marcador;
    tipoDeporte: TipoDeporte;
    isLive?: boolean;
    onScoreChange?: (newMarcador: Marcador) => void;
    evaluacion?: Record<string, number>;
}

export function Scoreboard({
    equipoLocal,
    equipoVisitante,
    marcador,
    tipoDeporte,
    isLive = false,
    onScoreChange,
    evaluacion
}: ScoreboardProps) {
    const audioGol = useRef<HTMLAudioElement | null>(null);
    const audioSilbato = useRef<HTMLAudioElement | null>(null);
    const prevScoreLocal = useRef(marcador?.goles_local || 0);
    const prevScoreVisitante = useRef(marcador?.goles_visitante || 0);

    useEffect(() => {
        audioGol.current = new Audio('/sounds/gol.mp3');
        audioSilbato.current = new Audio('/sounds/silbato.mp3');
    }, []);

    useEffect(() => {
        if (!isLive) return;

        const currentLocal = marcador?.goles_local || 0;
        const currentVisitante = marcador?.goles_visitante || 0;

        if (currentLocal > prevScoreLocal.current || currentVisitante > prevScoreVisitante.current) {
            audioGol.current?.play().catch(e => console.log("Audio play failed", e));
        }

        prevScoreLocal.current = currentLocal;
        prevScoreVisitante.current = currentVisitante;
    }, [marcador, isLive]);

    const handleScoreUpdate = (team: 'local' | 'visitante', delta: number) => {
        if (!onScoreChange) return;

        const currentVal = team === 'local'
            ? (marcador?.goles_local || 0)
            : (marcador?.goles_visitante || 0);

        const newVal = Math.max(0, currentVal + delta);

        const newMarcador = {
            ...marcador,
            [team === 'local' ? 'goles_local' : 'goles_visitante']: newVal
        };

        onScoreChange(newMarcador);
    };

    const getScoreControls = (team: 'local' | 'visitante') => {
        // Detect high scoring sports based on database configuration (tipo_marcador) or name fallback
        const isHighScoring =
            (tipoDeporte.tipo_marcador && ['puntos', 'tries'].includes(tipoDeporte.tipo_marcador.toLowerCase())) ||
            ['baloncesto', 'basket', 'badminton', 'voleibol', 'rugby'].some(s =>
                tipoDeporte.nombre.toLowerCase().includes(s) ||
                tipoDeporte.codigo.toLowerCase().includes(s)
            );

        return (
            <div className="flex flex-col gap-2 items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleScoreUpdate(team, -1)}
                        className="w-10 h-10 rounded-full bg-lme-surface-soft border border-lme-border hover:bg-white/10 flex items-center justify-center font-bold text-sub transition-colors"
                    >-</button>
                    <button
                        onClick={() => handleScoreUpdate(team, 1)}
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${team === 'local' ? 'from-mint/20 to-sky/20 border-mint/30 text-mint' : 'from-vio/20 to-edufis-mental-end/20 border-vio/30 text-vio'} border hover:brightness-110 flex items-center justify-center font-bold transition-colors`}
                    >+1</button>
                </div>
                {isHighScoring && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleScoreUpdate(team, 2)}
                            className={`w-10 h-10 rounded-full bg-gradient-to-r ${team === 'local' ? 'from-mint/10 to-sky/10 border-mint/20 text-mint' : 'from-vio/10 to-edufis-mental-end/10 border-vio/20 text-vio'} border hover:brightness-110 flex items-center justify-center font-bold transition-colors text-sm`}
                        >+2</button>
                        <button
                            onClick={() => handleScoreUpdate(team, 3)}
                            className={`w-10 h-10 rounded-full bg-gradient-to-r ${team === 'local' ? 'from-mint/10 to-sky/10 border-mint/20 text-mint' : 'from-vio/10 to-edufis-mental-end/10 border-vio/20 text-vio'} border hover:brightness-110 flex items-center justify-center font-bold transition-colors text-sm`}
                        >+3</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="glass-card overflow-hidden border-lme-border">
            {/* Header / Status Bar */}
            <div className="bg-sky/10 p-3 flex justify-between items-center text-xs font-medium text-sub border-b border-lme-border">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-red-400 font-semibold">EN VIVO</span>
                </div>
                <div className="text-ink uppercase tracking-wider">{tipoDeporte.nombre}</div>
                <div className="flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-mint" />
                    <span>Sonido Activo</span>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Local Team */}
                    <div className="flex-1 flex flex-col items-center text-center space-y-4">
                        <div className="relative group w-32 h-32 flex items-center justify-center">
                            <div className="absolute -inset-4 bg-gradient-to-r from-mint to-sky rounded-full opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500"></div>
                            {equipoLocal.logo_filename ? (
                                <img
                                    src={getImageUrl(`/static/uploads/${equipoLocal.logo_filename}`)}
                                    alt={equipoLocal.nombre}
                                    className="w-full h-full object-contain relative z-10"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-lme-surface-soft flex items-center justify-center border-2 border-mint/30 relative z-10">
                                    <span className="text-3xl font-bold text-mint">{equipoLocal.nombre.substring(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-ink">{equipoLocal.nombre}</h3>
                            <div className="flex gap-2 justify-center mt-2">
                                {(evaluacion?.grada_animar_local ?? 0) > 0 && (
                                    <Badge variant="success">
                                        <Users className="w-3 h-3 mr-1" /> Grada
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center mx-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <span className={`text-6xl md:text-7xl font-black tabular-nums tracking-tighter ${(marcador?.goles_local || 0) > (marcador?.goles_visitante || 0) ? 'text-mint drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]' : 'text-ink'
                                    }`}>
                                    {marcador?.goles_local || 0}
                                </span>
                            </div>
                            <span className="text-4xl text-sub/50 font-light">-</span>
                            <div className="relative">
                                <span className={`text-6xl md:text-7xl font-black tabular-nums tracking-tighter ${(marcador?.goles_visitante || 0) > (marcador?.goles_local || 0) ? 'text-vio drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'text-ink'
                                    }`}>
                                    {marcador?.goles_visitante || 0}
                                </span>
                            </div>
                        </div>

                        {/* Score Controls */}
                        {isLive && onScoreChange && (
                            <div className="flex gap-16 mt-8">
                                {getScoreControls('local')}
                                {getScoreControls('visitante')}
                            </div>
                        )}
                    </div>

                    {/* Visitor Team */}
                    <div className="flex-1 flex flex-col items-center text-center space-y-4">
                        <div className="relative group w-32 h-32 flex items-center justify-center">
                            <div className="absolute -inset-4 bg-gradient-to-r from-vio to-edufis-mental-end rounded-full opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500"></div>
                            {equipoVisitante.logo_filename ? (
                                <img
                                    src={getImageUrl(`/static/uploads/${equipoVisitante.logo_filename}`)}
                                    alt={equipoVisitante.nombre}
                                    className="w-full h-full object-contain relative z-10"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-lme-surface-soft flex items-center justify-center border-2 border-vio/30 relative z-10">
                                    <span className="text-3xl font-bold text-vio">{equipoVisitante.nombre.substring(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-ink">{equipoVisitante.nombre}</h3>
                            <div className="flex gap-2 justify-center mt-2">
                                {(evaluacion?.grada_animar_visitante ?? 0) > 0 && (
                                    <Badge variant="success">
                                        <Users className="w-3 h-3 mr-1" /> Grada
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Match Info / Referee */}
            <div className="mt-8 pt-6 border-t border-lme-border flex justify-center pb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-lme-surface-soft rounded-full text-sm text-sub border border-lme-border">
                    <User className="w-4 h-4 text-mint" />
                    <span className="font-semibold text-ink">Árbitro:</span>
                    <span>Equipo Arbitral Asignado</span>
                </div>
            </div>
        </Card>
    );
}
