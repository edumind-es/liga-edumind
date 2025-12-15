import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface LMECardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
}

const LMECard = forwardRef<HTMLDivElement, LMECardProps>(
    ({ className, hover = true, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'lme-card',
                    hover && 'hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

LMECard.displayName = 'LMECard';

const LMECardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('mb-4', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

LMECardHeader.displayName = 'LMECardHeader';

const LMECardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={cn('text-xl font-bold text-gray-900', className)}
                {...props}
            >
                {children}
            </h3>
        );
    }
);

LMECardTitle.displayName = 'LMECardTitle';

const LMECardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

LMECardContent.displayName = 'LMECardContent';

export { LMECard, LMECardHeader, LMECardTitle, LMECardContent };
