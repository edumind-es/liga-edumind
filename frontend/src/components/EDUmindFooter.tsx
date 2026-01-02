import './EDUmindFooter.css';

interface NavigationLink {
    href: string;
    label?: string;
}

interface EDUmindFooterProps {
    appName: string;
    version: string;
    versionStage?: 'Alpha' | 'Beta' | 'Stable' | 'RC';
    author?: string;
    year?: number;
    previousPage?: NavigationLink;
    nextPage?: NavigationLink;
    homeHref?: string;
    feedbackUrl?: string;
    feedbackLabel?: string;
    className?: string;
    locale?: 'es' | 'en' | 'zh';
    hideNavigation?: boolean;
    showVersion?: boolean;
}

interface FooterTranslations {
    previous: string;
    next: string;
    copyright: string;
    feedback: string;
    home: string;
}

const translations: Record<string, FooterTranslations> = {
    es: {
        previous: '← Anterior',
        next: 'Siguiente →',
        copyright: '© {year} EDUmind por',
        feedback: '📋 Reportar Error',
        home: '🏠 Inicio'
    },
    en: {
        previous: '← Previous',
        next: 'Next →',
        copyright: '© {year} EDUmind by',
        feedback: '📋 Report Issue',
        home: '🏠 Home'
    },
    zh: {
        previous: '← 上一页',
        next: '下一页 →',
        copyright: '© {year} EDUmind 由',
        feedback: '📋 报告问题',
        home: '🏠 首页'
    }
};

export default function EDUmindFooter({
    appName: _appName,
    version,
    versionStage,
    author = 'EDUmind Team',
    year = new Date().getFullYear(),
    previousPage,
    nextPage,
    homeHref,
    feedbackUrl,
    feedbackLabel,
    className = '',
    locale = 'es',
    hideNavigation = false,
    showVersion = true
}: EDUmindFooterProps) {
    const t = translations[locale] || translations.es;

    const versionBadge = versionStage
        ? `v${version} (${versionStage})`
        : `v${version}`;

    return (
        <footer className={`edumind-footer ${className}`}>
            {!hideNavigation && (previousPage || nextPage || homeHref) && (
                <div className="footer-nav">
                    {previousPage && (
                        <a href={previousPage.href} className="nav-btn nav-btn-prev">
                            {previousPage.label || t.previous}
                        </a>
                    )}

                    {previousPage && (nextPage || homeHref) && (
                        <span className="divider">|</span>
                    )}

                    {homeHref && !nextPage && (
                        <a href={homeHref} className="nav-btn nav-btn-home">
                            {t.home}
                        </a>
                    )}

                    {nextPage && (
                        <a href={nextPage.href} className="nav-btn nav-btn-next">
                            {nextPage.label || t.next}
                        </a>
                    )}
                </div>
            )}

            <div className="footer-info">
                <p>
                    {t.copyright.replace('{year}', year.toString())}{' '}
                    <strong>{author}</strong>
                </p>
            </div>

            <div className="footer-legal" style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#6b7280'
            }}>
                <a href="https://edumind.es/es/privacidad" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                }}>Privacidad</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://edumind.es/es/legal" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>Aviso Legal</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://edumind.es/es/cookies" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>Cookies</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://edumind.es/es/terminos" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>Términos</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://edumind.es/es/arco" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>ARCO</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://edumind.es/es/nosotros" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>Contacto</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://donar.losmundosedufis.com" target="_blank" rel="noopener noreferrer" style={{
                    color: '#10b981',
                    textDecoration: 'none',
                    fontWeight: '500'
                }}>💚 Apoyar</a>
            </div>

            <div className="footer-meta">
                {showVersion && (
                    <span className="badge version-badge">{versionBadge}</span>
                )}
                {feedbackUrl && (
                    <a
                        href={feedbackUrl}
                        className="feedback-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={feedbackLabel || t.feedback}
                    >
                        {feedbackLabel || t.feedback}
                    </a>
                )}
            </div>
        </footer>
    );
}
