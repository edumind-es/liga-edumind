import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { User, Lock, Sparkles } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [codigo, setCodigo] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login(codigo, password);
            navigate('/ligas');
        } catch {
            // Error is handled by store
        }
    };

    return (
        <div className="lme-body min-h-screen flex flex-col">
            <div className="lme-gradient"></div>

            {/* Navbar */}
            <nav className="navbar-edufis">
                <div className="container-xl">
                    <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                        <img src="/liga_logo_oficial.png" alt="Logo Liga EDUmind" className="lme-logo" width="40" height="40" />
                        <div className="d-flex flex-column">
                            <span className="fw-semibold text-white">Liga EDUmind</span>
                            <small className="text-white-50" style={{ fontSize: '0.75rem' }}>Los Mundos Edufis</small>
                        </div>
                    </Link>
                </div>
            </nav>

            <main className="lme-main flex-grow flex items-center justify-center py-8">
                <div className="container-xl">
                    <div className="lme-shell max-w-5xl mx-auto">
                        <div className="login-split">
                            {/* Form Section */}
                            <div className="login-split__form">
                                <div className="login-split__form-inner">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-2 rounded-lg bg-gradient-to-r from-mint to-sky">
                                                <Sparkles className="h-5 w-5 text-[#040614]" />
                                            </div>
                                            <h1 className="text-2xl font-bold text-ink">Acceso docente</h1>
                                        </div>
                                        <p className="text-sub">Introduce tus credenciales para gestionar tus ligas.</p>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        {error && (
                                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <label htmlFor="codigo" className="form-label flex items-center gap-2">
                                                <User className="h-4 w-4 text-sub" />
                                                Usuario
                                            </label>
                                            <input
                                                id="codigo"
                                                type="text"
                                                className="form-control"
                                                placeholder="Ej. docente23"
                                                required
                                                value={codigo}
                                                onChange={(e) => setCodigo(e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-5">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label htmlFor="password" className="form-label mb-0 flex items-center gap-2">
                                                    <Lock className="h-4 w-4 text-sub" />
                                                    Contraseña
                                                </label>
                                                <Link to="/forgot-password" className="small link-primary">
                                                    ¿Olvidaste tu contraseña?
                                                </Link>
                                            </div>
                                            <input
                                                id="password"
                                                type="password"
                                                className="form-control"
                                                placeholder="••••••••"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn-lme w-100"
                                        >
                                            {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
                                        </button>

                                        <div className="text-center mt-5 pt-4 border-top">
                                            <p className="mb-0 text-sub">
                                                ¿No tienes cuenta?{' '}
                                                <Link to="/register" className="link-primary fw-semibold">
                                                    Regístrate aquí
                                                </Link>
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Image Section */}
                            <div className="login-split__image">
                                <div className="login-split__image-frame">
                                    <img
                                        src="/liga_logo_oficial.png"
                                        alt="Logo oficial Liga EDUmind"
                                        className="login-split__image-img"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://placehold.co/400x300/0b1425/3ddad7?text=Liga+EDUmind";
                                        }}
                                    />
                                    <div className="login-split__image-caption">
                                        Gestión de valores deportivos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="lme-footer">
                <div className="container-xl">
                    <p className="mb-1">© 2025 Liga EDUmind · Recurso Educativo Abierto (REA)</p>
                    <p className="mb-0">
                        <Link to="/pin" className="me-3">Acceso por PIN</Link>
                        <Link to="/faq" className="me-3">Guía y FAQ</Link>
                        <Link to="/privacidad">Política de privacidad</Link>
                    </p>
                </div>
            </footer>
        </div>
    );
}
