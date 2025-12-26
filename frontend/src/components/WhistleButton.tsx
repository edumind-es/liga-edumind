import * as React from 'react';

interface WhistleButtonProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'floating';
}

/**
 * Whistle button component for referees to signal during matches.
 * Emits a sharp whistle sound when pressed.
 */
export function WhistleButton({ className = '', size = 'md', variant = 'default' }: WhistleButtonProps) {
    const [isPlaying, setIsPlaying] = React.useState(false);

    const sizeClasses = {
        sm: 'w-10 h-10 text-lg',
        md: 'w-14 h-14 text-2xl',
        lg: 'w-20 h-20 text-4xl'
    };

    const playWhistle = () => {
        if (isPlaying) return;

        setIsPlaying(true);

        // Create audio context for whistle sound generation
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create multiple oscillators for a richer whistle sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // High pitched whistle (main frequency)
        oscillator1.frequency.value = 2400;
        oscillator1.type = 'sine';

        // Slightly detuned for richness
        oscillator2.frequency.value = 2450;
        oscillator2.type = 'sine';

        // Volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.02);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.5);
        oscillator2.stop(audioContext.currentTime + 0.5);

        // Reset state after sound finishes
        setTimeout(() => {
            setIsPlaying(false);
        }, 500);
    };

    const baseClasses = variant === 'floating'
        ? 'fixed bottom-6 right-6 shadow-xl z-50'
        : '';

    return (
        <button
            onClick={playWhistle}
            disabled={isPlaying}
            className={`
                ${sizeClasses[size]}
                ${baseClasses}
                rounded-full
                flex items-center justify-center
                bg-gradient-to-br from-yellow-400 to-orange-500
                hover:from-yellow-300 hover:to-orange-400
                active:from-yellow-500 active:to-orange-600
                text-white
                shadow-lg hover:shadow-xl
                transition-all duration-150
                transform hover:scale-105 active:scale-95
                ${isPlaying ? 'animate-pulse scale-110' : ''}
                disabled:cursor-not-allowed
                ${className}
            `.trim().replace(/\s+/g, ' ')}
            title="Pitar silbato"
            aria-label="Pitar silbato"
        >
            <span role="img" aria-hidden="true">
                📣
            </span>
        </button>
    );
}

export default WhistleButton;
