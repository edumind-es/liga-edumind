import React from 'react';
import { User } from 'lucide-react';

interface TeamLogoProps {
    logoUrl?: string | null;
    teamName: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function TeamLogo({ logoUrl, teamName, size = 'md', className = '' }: TeamLogoProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base',
        xl: 'w-24 h-24 text-2xl'
    };

    const sizeClass = sizeClasses[size];

    // Generate initials from team name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    if (logoUrl) {
        return (
            <div className={`${sizeClass} rounded-lg overflow-hidden bg-paper/5 ${className}`}>
                <img
                    src={logoUrl}
                    alt={`Logo de ${teamName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    // Fallback: Show initials in a colored circle
    const bgColor = teamName.length % 5 === 0 ? 'bg-mint/20 text-mint' :
        teamName.length % 5 === 1 ? 'bg-sky/20 text-sky' :
            teamName.length % 5 === 2 ? 'bg-purple-500/20 text-purple-400' :
                teamName.length % 5 === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400';

    return (
        <div className={`${sizeClass} rounded-lg flex items-center justify-center ${bgColor} font-bold ${className}`}>
            {getInitials(teamName) || <User className="w-1/2 h-1/2" />}
        </div>
    );
}
