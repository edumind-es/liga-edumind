import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500", className)}>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl bg-gradient-to-r from-ink to-sub bg-clip-text">
                    {title}
                </h1>
                {description && (
                    <p className="text-sub text-sm md:text-base max-w-xl">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
