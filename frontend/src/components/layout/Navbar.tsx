import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Menu, X, LogOut, User } from 'lucide-react';

export function Navbar() {
    const { user, logout, isAuthenticated } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `nav-link px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
            ? 'text-mint bg-mint/10'
            : 'text-sub hover:text-ink hover:bg-white/5'
        }`;

    return (
        <nav className="navbar-edufis sticky top-0 z-50">
            <div className="container-xl flex items-center justify-between py-3">
                <Link
                    className="flex items-center gap-3 no-underline"
                    to={isAuthenticated ? "/ligas" : "/login"}
                    onClick={closeMenu}
                >
                    <img
                        src="/liga_logo_oficial.png"
                        alt="Logo Liga EDUmind"
                        className="lme-logo w-10 h-10 rounded-lg"
                    />
                    <div className="flex flex-col">
                        <span className="font-semibold text-ink text-base">Liga EDUmind</span>
                        <small className="text-sub text-xs">Los Mundos Edufis</small>
                    </div>
                </Link>

                {/* Mobile toggle */}
                <button
                    className="lg:hidden text-sub hover:text-ink p-2 rounded-lg hover:bg-white/5 transition-colors"
                    type="button"
                    onClick={toggleMenu}
                    aria-label="Alternar navegación"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>

                {/* Desktop & Mobile Navigation */}
                <div className={`
                    ${isOpen ? 'flex' : 'hidden'} 
                    lg:flex 
                    flex-col lg:flex-row 
                    items-start lg:items-center 
                    gap-4 lg:gap-2
                    absolute lg:static 
                    top-full left-0 right-0 
                    lg:top-auto
                    bg-[rgba(11,20,37,0.98)] lg:bg-transparent
                    backdrop-blur-xl lg:backdrop-blur-none
                    border-t border-lme-border lg:border-0
                    p-4 lg:p-0
                    w-full lg:w-auto
                `}>
                    <ul className="flex flex-col lg:flex-row gap-1 lg:gap-1 w-full lg:w-auto">
                        {isAuthenticated ? (
                            <>
                                <li>
                                    <NavLink className={navLinkClass} to="/ligas" onClick={closeMenu}>Panel</NavLink>
                                </li>
                                <li>
                                    <NavLink className={navLinkClass} to="/ligas/crear" onClick={closeMenu}>Crear liga</NavLink>
                                </li>
                                <li>
                                    <NavLink className={navLinkClass} to="/pin" onClick={closeMenu}>Acceso por PIN</NavLink>
                                </li>
                                <li>
                                    <NavLink className={navLinkClass} to="/faq" onClick={closeMenu}>Guía y FAQ</NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink className={navLinkClass} to="/login" onClick={closeMenu}>Iniciar sesión</NavLink>
                                </li>
                                <li>
                                    <NavLink className={navLinkClass} to="/register" onClick={closeMenu}>Registrarse</NavLink>
                                </li>
                                <li>
                                    <NavLink className={navLinkClass} to="/pin" onClick={closeMenu}>Acceso por PIN</NavLink>
                                </li>
                                <li>
                                    <NavLink className={navLinkClass} to="/faq" onClick={closeMenu}>Guía y FAQ</NavLink>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="flex items-center gap-3 w-full lg:w-auto mt-3 lg:mt-0 pt-3 lg:pt-0 border-t lg:border-0 border-lme-border">
                        {isAuthenticated && user ? (
                            <>
                                <span className="hidden lg:flex items-center gap-1.5 text-sm text-sub">
                                    <User className="h-4 w-4" />
                                    {user.codigo}
                                </span>
                                <button
                                    onClick={() => { logout(); closeMenu(); }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-lme-border text-sub hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/10 text-sm transition-all"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="lg:hidden xl:inline">Cerrar sesión</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="px-5 py-2 rounded-full bg-gradient-to-r from-mint to-sky text-[#040614] font-semibold text-sm shadow-[0_8px_20px_rgba(61,218,215,0.25)] hover:shadow-[0_12px_28px_rgba(61,218,215,0.35)] hover:-translate-y-0.5 transition-all no-underline"
                                onClick={closeMenu}
                            >
                                Acceso
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
