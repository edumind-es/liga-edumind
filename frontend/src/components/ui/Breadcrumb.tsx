import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center text-sm mb-4 animation-fadeInDown" aria-label="Breadcrumb">
            <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
                <Home className="h-3.5 w-3.5" />
                <span>Dashboard</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                    {item.href ? (
                        <Link
                            to={item.href}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}
