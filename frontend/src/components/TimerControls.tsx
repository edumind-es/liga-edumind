import * as React from 'react';

interface TimerControlsProps {
    tiempoRestante: number; // in seconds
    onUpdate: (newTime: number) => void;
    onTimerEnd?: () => void;
}

export function TimerControls({ tiempoRestante, onUpdate, onTimerEnd }: TimerControlsProps) {
    const [isRunning, setIsRunning] = React.useState(false);
    const [lastTick, setLastTick] = React.useState<number>(Date.now());
    const [showAdjust, setShowAdjust] = React.useState(false);

    React.useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - lastTick) / 1000);

            if (elapsed >= 1) {
                const newTime = Math.max(0, tiempoRestante - elapsed);
                onUpdate(newTime);
                setLastTick(now);

                if (newTime === 0) {
                    setIsRunning(false);
                    playWhistle();
                    onTimerEnd?.();
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isRunning, tiempoRestante, lastTick, onUpdate, onTimerEnd]);

    const toggleTimer = () => {
        if (!isRunning) {
            setLastTick(Date.now());
            playWhistle();
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        onUpdate(45 * 60); // 45 minutes default
        setLastTick(Date.now());
    };

    const adjustTime = (minutes: number) => {
        const newTime = Math.max(0, tiempoRestante + (minutes * 60));
        onUpdate(newTime);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const playWhistle = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 2000;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    };

    const timeColor = tiempoRestante < 60 ? 'text-red-400' : tiempoRestante < 180 ? 'text-yellow-400' : 'text-ink';

    return (
        <div className="text-center p-4 rounded-lg bg-paper/10 border border-paper/20 mb-6">
            <div className="text-sm text-sub mb-2">Tiempo de Partido</div>
            <div className={`text-5xl font-bold ${timeColor} mb-3`}>
                {formatTime(tiempoRestante)}
            </div>

            {/* Time Adjustment Controls */}
            <div className="mb-3">
                <button
                    onClick={() => setShowAdjust(!showAdjust)}
                    className="text-xs text-sub hover:text-mint transition-colors"
                >
                    {showAdjust ? '▼' : '▶'} Ajustar tiempo
                </button>

                {showAdjust && (
                    <div className="flex gap-1 justify-center mt-2 flex-wrap">
                        <button
                            onClick={() => adjustTime(-5)}
                            disabled={isRunning}
                            className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            -5min
                        </button>
                        <button
                            onClick={() => adjustTime(-1)}
                            disabled={isRunning}
                            className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            -1min
                        </button>
                        <button
                            onClick={() => adjustTime(1)}
                            disabled={isRunning}
                            className="px-2 py-1 text-xs rounded bg-mint/20 text-mint hover:bg-mint/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            +1min
                        </button>
                        <button
                            onClick={() => adjustTime(5)}
                            disabled={isRunning}
                            className="px-2 py-1 text-xs rounded bg-mint/20 text-mint hover:bg-mint/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            +5min
                        </button>
                        <button
                            onClick={() => adjustTime(10)}
                            disabled={isRunning}
                            className="px-2 py-1 text-xs rounded bg-mint/20 text-mint hover:bg-mint/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            +10min
                        </button>
                    </div>
                )}
            </div>

            {/* Main Controls */}
            <div className="flex gap-2 justify-center">
                <button
                    onClick={toggleTimer}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isRunning
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-mint/20 text-mint hover:bg-mint/30'
                        }`}
                >
                    {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-4 py-2 rounded-lg bg-paper/20 text-sub hover:bg-paper/30 font-semibold text-sm transition-all"
                >
                    🔄 Reiniciar
                </button>
            </div>
        </div>
    );
}
