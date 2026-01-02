import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Lock, UserPlus, ShieldCheck } from 'lucide-react';
import EDUmindFooter from '@/components/EDUmindFooter';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [codigo, setCodigo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setValidationError('');

        if (password.length < 6) {
            setValidationError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (!aceptaPrivacidad) {
            setValidationError('Debe aceptar la Política de Privacidad para registrarse');
            return;
        }

        try {
            await register(codigo, email, password, aceptaPrivacidad);
            navigate('/ligas');
        } catch (err) {
            console.error('Registration error:', err);
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
                                            <div className="p-2 rounded-lg bg-gradient-to-r from-vio to-edufis-mental-end">
                                                <UserPlus className="h-5 w-5 text-white" />
                                            </div>
                                            <h1 className="text-2xl font-bold text-ink">Crear cuenta docente</h1>
                                        </div>
                                        <p className="text-sub">Únete a la comunidad LME para gestionar tus ligas escolares.</p>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        {(error || validationError) && (
                                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                                                <span>{error || validationError}</span>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <label htmlFor="codigo" className="form-label flex items-center gap-2">
                                                <User className="h-4 w-4 text-sub" />
                                                Nombre de usuario
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
                                            <p className="text-sub text-xs mt-1.5">Será tu identificador único para iniciar sesión.</p>
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="email" className="form-label flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-sub" />
                                                Correo electrónico (opcional)
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                className="form-control"
                                                placeholder="ejemplo@centro.es"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            <p className="text-warning text-xs mt-1.5 flex items-center gap-1">
                                                <span className="text-amber-500">⚠️</span>
                                                Sin email configurado, no será posible recuperar tu cuenta si olvidas tu usuario o contraseña.
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="password" className="form-label flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-sub" />
                                                Contraseña
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                className="form-control"
                                                placeholder="••••••••"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <p className="text-sub text-xs mt-1.5">Mínimo 6 caracteres.</p>
                                        </div>

                                        {/* RGPD Consent Checkbox */}
                                        <div className="mb-5">
                                            <div className="form-check">
                                                <input
                                                    id="acepta_privacidad"
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    required
                                                    checked={aceptaPrivacidad}
                                                    onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                                                />
                                                <label className="form-check-label text-sm" htmlFor="acepta_privacidad">
                                                    <div className="flex items-start gap-2">
                                                        <ShieldCheck className="h-4 w-4 text-edufis-mental mt-0.5 flex-shrink-0" />
                                                        <span>
                                                            He leído y acepto la{' '}
                                                            <a href="https://edumind.es/es/privacidad" target="_blank" rel="noopener noreferrer" className="link-primary fw-semibold">
                                                                Política de Privacidad
                                                            </a>
                                                            {' '}(obligatorio para cumplimiento RGPD)
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn-lme w-100"
                                        >
                                            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                                        </button>

                                        <div className="text-center mt-5 pt-4 border-top">
                                            <p className="mb-0 text-sub">
                                                ¿Ya tienes cuenta?{' '}
                                                <Link to="/login" className="link-primary fw-semibold">
                                                    Inicia sesión aquí
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
                                        src="/static/images/login_illustration.png"
                                        alt="Ilustración Registro"
                                        className="login-split__image-img"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://placehold.co/400x300/0b1425/a963ff?text=Únete+a+LME";
                                        }}
                                    />
                                    <div className="login-split__image-caption">
                                        Únete a Liga EDUmind
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <EDUmindFooter
                appName="Liga EDUmind"
                version="1.5.2"
                versionStage="Beta"
                feedbackUrl="https://github.com/edumind-es/liga-valores/issues"
                locale="es"
                hideNavigation={true}
                showVersion={false}
            />
        </div>
    );
}
