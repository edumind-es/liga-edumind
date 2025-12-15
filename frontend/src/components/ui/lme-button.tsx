import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface LMEButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const LMEButton = forwardRef<HTMLButtonElement, LMEButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
        const baseStyles = 'font-semibold transition-all duration-200 inline-flex items-center justify-center rounded-full';

        const variantStyles = {
            primary: 'bg-gradient-to-r from-mint to-sky text-[#040614] shadow-[0_12px_28px_rgba(61,218,215,0.25)] hover:shadow-[0_18px_36px_rgba(61,218,215,0.35)] hover:-translate-y-0.5',
            outline: 'border border-lme-border bg-transparent text-ink hover:bg-white/5 hover:border-sub',
            ghost: 'bg-transparent hover:bg-white/5 text-sub hover:text-ink border-0'
        };

        const sizeStyles = {
            sm: 'text-sm px-4 py-2',
            md: 'text-base px-6 py-2.5',
            lg: 'text-lg px-8 py-3'
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

LMEButton.displayName = 'LMEButton';

export { LMEButton };
