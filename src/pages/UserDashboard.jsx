import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Activity, CheckCircle, Clock } from 'lucide-react';

const UserDashboard = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="page-container" style={{ padding: '2rem 1rem' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>{t('dashWelcome')}, {user.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('dashMobile')} {user.mobile} • {user.location}</p>
        </div>
        <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }} style={{ padding: '0.6rem 1.2rem' }}>
          {t('dashLogout')}
        </button>
      </div>

      {/* Main Action Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Card 1 */}
        <Link to="/report" className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', borderTop: '4px solid #F97316' }}>
          <div style={{ backgroundColor: '#fff7ed', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#F97316' }}>
            <AlertTriangle size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('dashReportLabel')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('dashReportDesc')}</p>
        </Link>

        {/* Card 2 */}
        <Link to="/complaints" className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', borderTop: '4px solid #16A34A' }}>
          <div style={{ backgroundColor: '#f0fdf4', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#16A34A' }}>
            <Activity size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('dashTrackLabel')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('dashTrackDesc')}</p>
        </Link>

        {/* Card 3 */}
        <Link to="/schemes" className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', borderTop: '4px solid #16A34A' }}>
          <div style={{ backgroundColor: '#f0fdf4', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#16A34A' }}>
            <CheckCircle size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('dashSchemesLabel')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('dashSchemesDesc')}</p>
        </Link>

      </div>

      {/* Recent Activity Section */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#F97316" /> {t('dashActivity')}
        </h3>
        
        <div style={{ borderLeft: '2px solid #e5e7eb', marginLeft: '10px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#16A34A', border: '2px solid white' }}></div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{t('dashProfileSync')}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashProfileSyncDesc')}</p>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e5e7eb', border: '2px solid white' }}></div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('dashNoComplaints')}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashReportAcross')} {user.location || t('dashYourArea')} {t('dashTrackProgressHere')}</p>
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default UserDashboard;
