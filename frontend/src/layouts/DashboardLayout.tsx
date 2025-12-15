import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from 'sonner';
import EDUmindFooter from '@/components/EDUmindFooter';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="lme-body min-h-screen flex flex-col relative">
            <div className="lme-gradient"></div>

            <Navbar />

            <main className="lme-main flex-grow py-6">
                <div className="container-xl">
                    <div className="lme-shell">
                        {children}
                    </div>
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

            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(11, 20, 37, 0.95)',
                        border: '1px solid rgba(90, 126, 181, 0.38)',
                        color: '#f5fbff',
                    },
                }}
            />
        </div>
    );
}
