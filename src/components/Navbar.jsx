import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Building2, Globe, ChevronDown, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = React.useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleHomeClick = () => {
    if (location.pathname === '/' && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getLanguageLabel = (code) => {
    switch (code) {
      case 'hi': return 'Hindi';
      case 'te': return 'Telugu';
      case 'ta': return 'Tamil';
      case 'kn': return 'Kannada';
      case 'mr': return 'Marathi';
      case 'bn': return 'Bengali';
      default: return 'English';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={handleHomeClick} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={28} className="logo-icon" />
          <span className="logo-text">Viksit Bharat</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={handleHomeClick}>
            {t('navHome')}
          </Link>
          <Link to="/schemes" className={`nav-link ${isActive('/schemes')}`}>
            {t('navSchemes')}
          </Link>
          <Link to="/community" className={`nav-link ${isActive('/community')}`}>
            {t('navCommunity')}
          </Link>
          <Link to="/community-leaders" className={`nav-link ${isActive('/community-leaders')}`}>
            {t('navLeaders')}
          </Link>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            {t('navDashboard')}
          </Link>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: '0.5rem', borderRadius: '8px' }}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Language Dropdown */}
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 600, padding: '0.5rem', borderRadius: '8px' }}
            >
              <Globe size={20} />
              <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{getLanguageLabel(language)}</span>
            </button>
            
            {isLangOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', overflow: 'hidden', zIndex: 100, minWidth: '130px' }}>
                <button onClick={() => { setLanguage('en'); setIsLangOpen(false); }} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.9rem' }}>English</button>
                <button onClick={() => { setLanguage('hi'); setIsLangOpen(false); }} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.9rem' }}>Hindi (हिंदी)</button>
                <button onClick={() => { setLanguage('te'); setIsLangOpen(false); }} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.9rem' }}>Telugu (తెలుగు)</button>
                <button onClick={() => { setLanguage('ta'); setIsLangOpen(false); }} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.9rem' }}>Tamil (தமிழ்)</button>
                <button onClick={() => { setLanguage('kn'); setIsLangOpen(false); }} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.9rem' }}>Kannada (ಕన్నడ)</button>
                <button onClick={() => { setLanguage('mr'); setIsLangOpen(false); }} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.9rem' }}>Marathi (मराठी)</button>
                <button onClick={() => { setLanguage('bn'); setIsLangOpen(false); }} style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.9rem' }}>Bengali (বাংলা)</button>
              </div>
            )}
          </div>

          {!isAuthenticated ? (
            <Link to="/login" className="nav-button btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px' }}>
              {t('navLogin')}
            </Link>
          ) : (
            <button onClick={logout} className="nav-button btn-outline" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px' }}>
              {t('navLogout')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
