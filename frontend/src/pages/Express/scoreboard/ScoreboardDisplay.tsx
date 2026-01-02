import * as React from 'react';
import { TimerControls } from '@/components/TimerControls';
import { WhistleButton } from '@/components/WhistleButton';
import type { DeporteConfig, TipoMarcador } from '@/types/marcador';

// Extended window type for webkit audio context
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

/**
 * Marcador type uses 'any' intentionally because:
 * 1. Sport scoreboards have dynamic keys (goles_local, puntos_visitante, etc.)
 * 2. TypeScript cannot perform arithmetic on 'unknown' type
 * 3. Keys are computed at runtime (e.g., `goles_${team}`)
 * 
 * The typed interfaces in @/types/marcador.ts provide documentation
 * for the expected structure of each sport type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarcadorRecord = Record<string, any>;

interface ScoreboardDisplayProps {
    tipo: TipoMarcador | string;
    marcador: MarcadorRecord;
    config?: DeporteConfig;
    onUpdate: (updates: MarcadorRecord) => void;
}

// Sound effect utility
function playGoalSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext!)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 440;
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

export default function ScoreboardDisplay({ tipo, marcador, onUpdate }: ScoreboardDisplayProps) {
    switch (tipo) {
        case 'goles':
            return <GolesScoreboard marcador={marcador} onUpdate={onUpdate} />;
        case 'puntos':
            return <PuntosScoreboard marcador={marcador} onUpdate={onUpdate} />;
        case 'sets':
            return <SetsScoreboard marcador={marcador} onUpdate={onUpdate} />;
        case 'tries':
            return <TriesScoreboard marcador={marcador} onUpdate={onUpdate} />;
        case 'carreras':
            return <CarrerasScoreboard marcador={marcador} onUpdate={onUpdate} />;
        case 'towertouchball':
            return <TowerTouchballScoreboard marcador={marcador} onUpdate={onUpdate} />;
        default:
            return <GenericScoreboard marcador={marcador} />;
    }
}

// Component helpers
interface SubScoreboardProps {
    marcador: MarcadorRecord;
    onUpdate: (updates: MarcadorRecord) => void;
}

function GolesScoreboard({ marcador, onUpdate }: SubScoreboardProps) {
    const increment = (team: 'local' | 'visitante') => {
        const key = `goles_${team}`;
        onUpdate({ [key]: (marcador[key] || 0) + 1 });
        playGoalSound();
    };

    const decrement = (team: 'local' | 'visitante') => {
        const key = `goles_${team}`;
        onUpdate({ [key]: Math.max(0, (marcador[key] || 0) - 1) });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <TimerControls
                    tiempoRestante={marcador.tiempo_restante || 45 * 60}
                    onUpdate={(newTime) => onUpdate({ tiempo_restante: newTime })}
                />
                <WhistleButton size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <ScoreColumn
                    label="Local"
                    value={marcador.goles_local || 0}
                    onIncrement={() => increment('local')}
                    onDecrement={() => decrement('local')}
                />
                <ScoreColumn
                    label="Visitante"
                    value={marcador.goles_visitante || 0}
                    onIncrement={() => increment('visitante')}
                    onDecrement={() => decrement('visitante')}
                />
            </div>
        </div>
    );
}

function PuntosScoreboard({ marcador, onUpdate }: SubScoreboardProps) {
    const adjust = (team: 'local' | 'visitante', amount: number) => {
        const key = `puntos_${team}`;
        onUpdate({ [key]: Math.max(0, (marcador[key] || 0) + amount) });
        if (amount > 0) playGoalSound();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <TimerControls
                    tiempoRestante={marcador.tiempo_restante || 40 * 60}
                    onUpdate={(newTime) => onUpdate({ tiempo_restante: newTime })}
                />
                <WhistleButton size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-ink">Local</h3>
                    <div className="text-7xl font-bold text-mint">{marcador.puntos_local || 0}</div>
                    <div className="flex gap-2 justify-center flex-wrap">
                        <button onClick={() => adjust('local', 1)} className="px-4 py-2 rounded-lg bg-mint/20 hover:bg-mint/30 text-mint font-bold transition-colors">+1</button>
                        <button onClick={() => adjust('local', 2)} className="px-4 py-2 rounded-lg bg-mint/20 hover:bg-mint/30 text-mint font-bold transition-colors">+2</button>
                        <button onClick={() => adjust('local', 3)} className="px-4 py-2 rounded-lg bg-mint/20 hover:bg-mint/30 text-mint font-bold transition-colors">+3</button>
                        <button onClick={() => adjust('local', -1)} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold transition-colors">-1</button>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-ink">Visitante</h3>
                    <div className="text-7xl font-bold text-sky">{marcador.puntos_visitante || 0}</div>
                    <div className="flex gap-2 justify-center flex-wrap">
                        <button onClick={() => adjust('visitante', 1)} className="px-4 py-2 rounded-lg bg-sky/20 hover:bg-sky/30 text-sky font-bold transition-colors">+1</button>
                        <button onClick={() => adjust('visitante', 2)} className="px-4 py-2 rounded-lg bg-sky/20 hover:bg-sky/30 text-sky font-bold transition-colors">+2</button>
                        <button onClick={() => adjust('visitante', 3)} className="px-4 py-2 rounded-lg bg-sky/20 hover:bg-sky/30 text-sky font-bold transition-colors">+3</button>
                        <button onClick={() => adjust('visitante', -1)} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold transition-colors">-1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SetsScoreboard({ marcador, onUpdate }: SubScoreboardProps) {
    // Check for set win condition: 25 points minimum with 2 point lead (or 15 for tiebreak set 5)
    const checkSetWin = (puntosLocal: number, puntosVisitante: number, setActual: number) => {
        const minPoints = setActual >= 5 ? 15 : 25; // Set 5 is a tiebreak to 15
        const diff = Math.abs(puntosLocal - puntosVisitante);

        if (puntosLocal >= minPoints && diff >= 2 && puntosLocal > puntosVisitante) {
            return 'local';
        }
        if (puntosVisitante >= minPoints && diff >= 2 && puntosVisitante > puntosLocal) {
            return 'visitante';
        }
        return null;
    };

    const adjustPuntos = (team: 'local' | 'visitante', amount: number) => {
        const key = `puntos_set_actual_${team}`;
        const newPuntos = Math.max(0, (marcador[key] || 0) + amount);

        // Get current scores
        const puntosLocal = team === 'local' ? newPuntos : (marcador.puntos_set_actual_local || 0);
        const puntosVisitante = team === 'visitante' ? newPuntos : (marcador.puntos_set_actual_visitante || 0);
        const setActual = marcador.set_actual || 1;

        // Check for automatic set win
        const winner = checkSetWin(puntosLocal, puntosVisitante, setActual);

        if (winner && amount > 0) {
            // Set won! Update sets and reset points
            const newSetsWinner = (marcador[`sets_${winner}`] || 0) + 1;
            onUpdate({
                [key]: newPuntos,
                [`sets_${winner}`]: newSetsWinner,
                // Store set history before resetting
                [`set_${setActual}_local`]: puntosLocal,
                [`set_${setActual}_visitante`]: puntosVisitante,
            });

            // Slight delay, then reset for next set
            setTimeout(() => {
                onUpdate({
                    puntos_set_actual_local: 0,
                    puntos_set_actual_visitante: 0,
                    set_actual: setActual + 1
                });
            }, 500);

            playGoalSound();
        } else {
            onUpdate({ [key]: newPuntos });
            if (amount > 0) playGoalSound();
        }
    };

    const cambiarSetManual = (winner: 'local' | 'visitante') => {
        const setActual = marcador.set_actual || 1;
        const puntosLocal = marcador.puntos_set_actual_local || 0;
        const puntosVisitante = marcador.puntos_set_actual_visitante || 0;

        onUpdate({
            [`sets_${winner}`]: (marcador[`sets_${winner}`] || 0) + 1,
            [`set_${setActual}_local`]: puntosLocal,
            [`set_${setActual}_visitante`]: puntosVisitante,
            puntos_set_actual_local: 0,
            puntos_set_actual_visitante: 0,
            set_actual: setActual + 1
        });
        playGoalSound();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <TimerControls
                    tiempoRestante={marcador.tiempo_restante || 25 * 60}
                    onUpdate={(newTime) => onUpdate({ tiempo_restante: newTime })}
                />
                <WhistleButton size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                    <div className="text-sm text-sub mb-1">Sets Local</div>
                    <div className="text-5xl font-bold text-mint">{marcador.sets_local || 0}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-sub mb-1">Sets Visitante</div>
                    <div className="text-5xl font-bold text-sky">{marcador.sets_visitante || 0}</div>
                </div>
            </div>

            <div className="border-t border-paper/20 pt-6">
                <div className="text-center text-sub text-sm mb-4">Set Actual: {marcador.set_actual || 1}</div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="text-center space-y-3">
                        <div className="text-3xl font-bold text-ink">{marcador.puntos_set_actual_local || 0}</div>
                        <div className="flex gap-2 justify-center">
                            <button onClick={() => adjustPuntos('local', 1)} className="px-3 py-1 rounded bg-mint/20 text-mint">+1</button>
                            <button onClick={() => adjustPuntos('local', -1)} className="px-3 py-1 rounded bg-red-500/20 text-red-400">-1</button>
                        </div>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="text-3xl font-bold text-ink">{marcador.puntos_set_actual_visitante || 0}</div>
                        <div className="flex gap-2 justify-center">
                            <button onClick={() => adjustPuntos('visitante', 1)} className="px-3 py-1 rounded bg-sky/20 text-sky">+1</button>
                            <button onClick={() => adjustPuntos('visitante', -1)} className="px-3 py-1 rounded bg-red-500/20 text-red-400">-1</button>
                        </div>
                    </div>
                </div>

                {/* Manual Set Control */}
                <div className="mt-6 border-t border-paper/20 pt-4">
                    <div className="text-center text-sub text-xs mb-3">Control Manual de Set (Árbitro)</div>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => cambiarSetManual('local')}
                            className="px-4 py-2 rounded-lg bg-mint/10 border border-mint/30 text-mint text-sm hover:bg-mint/20 transition-colors"
                        >
                            🏆 Set para Local
                        </button>
                        <button
                            onClick={() => cambiarSetManual('visitante')}
                            className="px-4 py-2 rounded-lg bg-sky/10 border border-sky/30 text-sky text-sm hover:bg-sky/20 transition-colors"
                        >
                            🏆 Set para Visitante
                        </button>
                    </div>
                    <div className="text-center text-sub/60 text-xs mt-2">
                        Auto: 25pts con 2 de diferencia (15 en set 5)
                    </div>
                </div>
            </div>
        </div>
    );
}


function TriesScoreboard({ marcador, onUpdate }: SubScoreboardProps) {
    const incrementTry = (team: 'local' | 'visitante') => {
        onUpdate({ [`tries_${team}`]: (marcador[`tries_${team}`] || 0) + 1 });
        playGoalSound();
    };

    const decrementTry = (team: 'local' | 'visitante') => {
        onUpdate({ [`tries_${team}`]: Math.max(0, (marcador[`tries_${team}`] || 0) - 1) });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <TimerControls
                    tiempoRestante={marcador.tiempo_restante || 40 * 60}
                    onUpdate={(newTime) => onUpdate({ tiempo_restante: newTime })}
                />
                <WhistleButton size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-center text-lg font-semibold text-ink">Local</h3>
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-sm text-sub">Tries</div>
                            <div className="text-4xl font-bold text-mint">{marcador.tries_local || 0}</div>
                            <div className="flex gap-2 justify-center mt-2">
                                <button onClick={() => incrementTry('local')} className="px-3 py-1 rounded bg-mint/20 text-mint">+1</button>
                                <button onClick={() => decrementTry('local')} className="px-3 py-1 rounded bg-red-500/20 text-red-400">-1</button>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-sub">Conversiones</div>
                            <div className="text-2xl font-bold text-ink">{marcador.conversiones_local || 0}</div>
                            <div className="flex gap-2 justify-center mt-2">
                                <button onClick={() => onUpdate({ conversiones_local: (marcador.conversiones_local || 0) + 1 })} className="px-3 py-1 rounded bg-mint/20 text-mint">+1</button>
                                <button onClick={() => onUpdate({ conversiones_local: Math.max(0, (marcador.conversiones_local || 0) - 1) })} className="px-3 py-1 rounded bg-red-500/20 text-red-400">-1</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-center text-lg font-semibold text-ink">Visitante</h3>
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-sm text-sub">Tries</div>
                            <div className="text-4xl font-bold text-sky">{marcador.tries_visitante || 0}</div>
                            <div className="flex gap-2 justify-center mt-2">
                                <button onClick={() => incrementTry('visitante')} className="px-3 py-1 rounded bg-sky/20 text-sky">+1</button>
                                <button onClick={() => decrementTry('visitante')} className="px-3 py-1 rounded bg-red-500/20 text-red-400">-1</button>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-sub">Conversiones</div>
                            <div className="text-2xl font-bold text-ink">{marcador.conversiones_visitante || 0}</div>
                            <div className="flex gap-2 justify-center mt-2">
                                <button onClick={() => onUpdate({ conversiones_visitante: (marcador.conversiones_visitante || 0) + 1 })} className="px-3 py-1 rounded bg-sky/20 text-sky">+1</button>
                                <button onClick={() => onUpdate({ conversiones_visitante: Math.max(0, (marcador.conversiones_visitante || 0) - 1) })} className="px-3 py-1 rounded bg-red-500/20 text-red-400">-1</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CarrerasScoreboard({ marcador, onUpdate }: SubScoreboardProps) {
    const incrementCarrera = (team: 'local' | 'visitante') => {
        onUpdate({ [`carreras_${team}`]: (marcador[`carreras_${team}`] || 0) + 1 });
        playGoalSound();
    };

    const decrementCarrera = (team: 'local' | 'visitante') => {
        onUpdate({ [`carreras_${team}`]: Math.max(0, (marcador[`carreras_${team}`] || 0) - 1) });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <TimerControls
                    tiempoRestante={marcador.tiempo_restante || 90 * 60}
                    onUpdate={(newTime) => onUpdate({ tiempo_restante: newTime })}
                />
                <WhistleButton size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <ScoreColumn
                    label="Local"
                    value={marcador.carreras_local || 0}
                    onIncrement={() => incrementCarrera('local')}
                    onDecrement={() => decrementCarrera('local')}
                />
                <ScoreColumn
                    label="Visitante"
                    value={marcador.carreras_visitante || 0}
                    onIncrement={() => incrementCarrera('visitante')}
                    onDecrement={() => decrementCarrera('visitante')}
                />
            </div>
        </div>
    );
}

function TowerTouchballScoreboard({ marcador, onUpdate }: SubScoreboardProps) {
    const [isRunning, setIsRunning] = React.useState(false);
    const initialTick = React.useRef(Date.now());
    const [lastTick, setLastTick] = React.useState<number>(() => initialTick.current);

    // Sound helper function - must be declared before use in effects
    const playSound = React.useCallback((type: 'whistle' | 'goal') => {
        // Create audio context for sound generation
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'whistle') {
            // High pitched whistle
            oscillator.frequency.value = 2000;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'goal') {
            // Goal celebration sound
            oscillator.frequency.value = 440;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

            // Rising pitch
            oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    }, []);

    // Timer effect
    React.useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - lastTick) / 1000);

            if (elapsed >= 1) {
                const newTime = Math.max(0, (marcador.tiempo_restante || 900) - elapsed);
                onUpdate({ tiempo_restante: newTime });
                setLastTick(now);

                // Play whistle when time runs out
                if (newTime === 0) {
                    setIsRunning(false);
                    playSound('whistle');
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isRunning, marcador.tiempo_restante, lastTick, onUpdate]);

    const adjustPuntos = (team: 'local' | 'visitante', amount: number) => {
        const key = `puntos_${team}`;
        const newValue = (marcador[key] || 0) + amount;
        onUpdate({ [key]: newValue });

        // Play goal sound when scoring
        if (amount > 0) {
            playSound('goal');
        }
    };

    const toggleCono = (team: 'local' | 'visitante', index: number) => {
        const key = `conos_${team}`;
        const conos = [...(marcador[key] || [false, false, false])];
        conos[index] = !conos[index];
        onUpdate({ [key]: conos });

        // Play sound when knocking down cone
        if (!marcador[key]?.[index]) {
            playSound('whistle');
        }
    };

    const toggleTimer = () => {
        if (!isRunning) {
            setLastTick(Date.now());
            playSound('whistle'); // Start whistle
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        onUpdate({ tiempo_restante: 15 * 60 });
        setLastTick(Date.now());
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };



    const timeRemaining = marcador.tiempo_restante || 900;
    const timeColor = timeRemaining < 60 ? 'text-red-400' : timeRemaining < 180 ? 'text-yellow-400' : 'text-ink';

    return (
        <div className="space-y-6">
            {/* Timer */}
            <div className="text-center p-6 rounded-lg bg-paper/10 border-2 border-paper/20">
                <div className="text-sm text-sub mb-2">Tiempo Restante</div>
                <div className={`text-6xl font-bold ${timeColor} mb-4`}>
                    {formatTime(timeRemaining)}
                </div>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={toggleTimer}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${isRunning
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-mint/20 text-mint hover:bg-mint/30'
                            }`}
                    >
                        {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="px-6 py-3 rounded-lg bg-paper/20 text-sub hover:bg-paper/30 font-semibold transition-all"
                    >
                        🔄 Reiniciar
                    </button>
                </div>
            </div>

            {/* Puntos */}
            <div className="grid grid-cols-2 gap-8">
                <div className="text-center space-y-3">
                    <div className="text-sm text-sub">Puntos Local</div>
                    <div className="text-5xl font-bold text-mint">{marcador.puntos_local || 0}</div>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => adjustPuntos('local', 1)}
                            className="px-4 py-2 rounded-lg bg-mint/20 text-mint font-bold hover:bg-mint/30 transition-colors"
                        >
                            +1
                        </button>
                        <button
                            onClick={() => adjustPuntos('local', -1)}
                            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-colors"
                        >
                            -1
                        </button>
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <div className="text-sm text-sub">Puntos Visitante</div>
                    <div className="text-5xl font-bold text-sky">{marcador.puntos_visitante || 0}</div>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => adjustPuntos('visitante', 1)}
                            className="px-4 py-2 rounded-lg bg-sky/20 text-sky font-bold hover:bg-sky/30 transition-colors"
                        >
                            +1
                        </button>
                        <button
                            onClick={() => adjustPuntos('visitante', -1)}
                            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-colors"
                        >
                            -1
                        </button>
                    </div>
                </div>
            </div>

            {/* Conos */}
            <div className="border-t border-paper/20 pt-6">
                <div className="text-center text-sm text-sub mb-4">Conos Derribados</div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <div className="text-center text-xs text-sub mb-2">Local</div>
                        <div className="flex gap-2 justify-center">
                            {[0, 1, 2].map((i) => (
                                <button
                                    key={i}
                                    onClick={() => toggleCono('local', i)}
                                    className={`w-14 h-14 rounded-lg border-2 transition-all hover:scale-110 ${(marcador.conos_local || [])[i]
                                        ? 'bg-red-500 border-red-400 animate-pulse'
                                        : i === 0
                                            ? 'bg-yellow-500/20 border-yellow-500/40'
                                            : 'bg-mint/20 border-mint/40'
                                        }`}
                                    title={i === 0 ? 'Cono Especial' : `Cono ${i + 1}`}
                                >
                                    <div className="text-2xl">{i === 0 && '⭐'}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-center text-xs text-sub mb-2">Visitante</div>
                        <div className="flex gap-2 justify-center">
                            {[0, 1, 2].map((i) => (
                                <button
                                    key={i}
                                    onClick={() => toggleCono('visitante', i)}
                                    className={`w-14 h-14 rounded-lg border-2 transition-all hover:scale-110 ${(marcador.conos_visitante || [])[i]
                                        ? 'bg-red-500 border-red-400 animate-pulse'
                                        : i === 0
                                            ? 'bg-yellow-500/20 border-yellow-500/40'
                                            : 'bg-sky/20 border-sky/40'
                                        }`}
                                    title={i === 0 ? 'Cono Especial' : `Cono ${i + 1}`}
                                >
                                    <div className="text-2xl">{i === 0 && '⭐'}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-center text-xs text-sub mt-3">
                    ⭐ = Cono especial (no derribar primero)
                </div>
            </div>
        </div>
    );
}

function GenericScoreboard({ marcador }: { marcador: Record<string, any> }) {
    return (
        <div className="text-center py-8">
            <p className="text-sub">Marcador genérico</p>
            <pre className="mt-4 text-xs text-sub">{JSON.stringify(marcador, null, 2)}</pre>
        </div>
    );
}

// Reusable Score Column Component
interface ScoreColumnProps {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

function ScoreColumn({ label, value, onIncrement, onDecrement }: ScoreColumnProps) {
    return (
        <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-ink">{label}</h3>
            <div className="text-7xl font-bold text-mint">{value}</div>
            <div className="flex gap-2 justify-center">
                <button
                    onClick={onIncrement}
                    className="px-6 py-3 rounded-lg bg-mint/20 hover:bg-mint/30 text-mint font-bold text-lg transition-colors"
                >
                    +1
                </button>
                <button
                    onClick={onDecrement}
                    className="px-6 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-lg transition-colors"
                >
                    -1
                </button>
            </div>
        </div>
    );
}
