import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction
}: EmptyStateProps) {
    return (
        <div className="text-center py-16 px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-mint/20 to-sky/20 flex items-center justify-center border border-mint/20">
                <Icon className="h-12 w-12 text-mint" />
            </div>
            <h3 className="text-2xl font-bold text-ink mb-3">
                {title}
            </h3>
            <p className="text-sub mb-8 max-w-md mx-auto">
                {description}
            </p>
            {(actionLabel && (actionHref || onAction)) && (
                actionHref ? (
                    <Link to={actionHref}>
                        <Button size="lg">
                            {actionLabel}
                        </Button>
                    </Link>
                ) : (
                    <Button onClick={onAction} size="lg">
                        {actionLabel}
                    </Button>
                )
            )}
        </div>
    );
}
