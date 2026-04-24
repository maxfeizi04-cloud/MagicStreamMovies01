import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useLanguage from '../../hooks/useLanguage';
import logo from '../../assets/MagicStreamLogo.png';

const Header = ({ handleLogout }) => {
    const { auth } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const roleLabel = auth?.role ? t(`roles.${auth.role}`) : '';

    return (
        <header className="app-header">
            <div className="app-header__inner">
                <Link to="/" className="brand-mark">
                    <img src={logo} alt="Magic Stream" className="brand-mark__logo" />
                    <div>
                        <p className="brand-mark__eyebrow">{t('header.eyebrow')}</p>
                        <span className="brand-mark__title">MagicStream</span>
                    </div>
                </Link>

                <nav className="app-nav">
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'app-nav__link is-active' : 'app-nav__link'}>
                        {t('header.discover')}
                    </NavLink>
                    <NavLink to="/recommended" className={({ isActive }) => isActive ? 'app-nav__link is-active' : 'app-nav__link'}>
                        {t('header.recommended')}
                    </NavLink>
                </nav>

                <div className="app-header__actions">
                    <div className="language-switcher" role="group" aria-label="Language switcher">
                        <button
                            type="button"
                            className={language === 'zh' ? 'language-switcher__button is-active' : 'language-switcher__button'}
                            onClick={() => setLanguage('zh')}
                        >
                            {t('common.chinese')}
                        </button>
                        <button
                            type="button"
                            className={language === 'en' ? 'language-switcher__button is-active' : 'language-switcher__button'}
                            onClick={() => setLanguage('en')}
                        >
                            {t('common.english')}
                        </button>
                    </div>
                    {auth ? (
                        <>
                            <div className="session-pill">
                                <span>{auth.first_name}</span>
                                <strong>{roleLabel || auth.role}</strong>
                            </div>
                            <button type="button" className="ghost-button" onClick={handleLogout}>
                                {t('header.logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="ghost-button">
                                {t('header.login')}
                            </Link>
                            <Link to="/register" className="accent-button">
                                {t('header.createAccount')}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
