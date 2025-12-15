import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 border border-red-100">
                        <h1 className="text-xl font-bold text-red-600 mb-4">Algo salió mal</h1>
                        <p className="text-gray-600 mb-4">Se ha producido un error inesperado.</p>
                        <div className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs font-mono text-red-800 mb-6">
                            {this.state.error?.message}
                            {this.state.error?.stack && (
                                <div className="mt-2 opacity-50">
                                    {this.state.error.stack.slice(0, 300)}...
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
