import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
import EDUmindFooter from '@/components/EDUmindFooter';

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <header className="fixed top-0 z-50 w-full glass-panel border-b-0 border-white/20 h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/90 p-1.5 rounded-lg shadow-sm">
                                <Shield className="h-6 w-6 text-lme-primary-dark" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-lme-primary-dark to-lme-bg-start leading-tight">
                                    Liga EDUmind
                                </span>
                                <span className="text-[10px] font-semibold text-lme-primary-dark tracking-wider uppercase">
                                    Acceso Público
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="pt-20 pb-12 px-4 flex-1">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
            <EDUmindFooter
                appName="Liga EDUmind"
                version="1.5.2"
                versionStage="Beta"
                feedbackUrl="https://github.com/edumind-es/liga-valores/issues"
                homeHref="/dashboard"
                locale="es"
                hideNavigation={true}
            />
        </div>
    );
}
