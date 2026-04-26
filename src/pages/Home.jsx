import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';
import { 
  Building2, 
  ArrowRight, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart2, 
  MessageSquare, 
  Mic, 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  BookOpen, 
  Building,
  UserPlus,
  FileText
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-wrapper">
      <div className="chakra-bg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
          <defs>
            <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e65100" />
              <stop offset="100%" stopColor="#1b5e20" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#chakraGradient)" strokeWidth="3"/>
          <circle cx="50" cy="50" r="8" fill="url(#chakraGradient)"/>
          <line x1="58" y1="50" x2="95" y2="50" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="57.727" y1="52.071" x2="93.467" y2="61.647" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="56.928" y1="54" x2="88.971" y2="72.5" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="55.657" y1="55.657" x2="81.820" y2="81.820" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="54" y1="56.928" x2="72.5" y2="88.971" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="52.071" y1="57.727" x2="61.647" y2="93.467" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="50" y1="58" x2="50" y2="95" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="47.929" y1="57.727" x2="38.353" y2="93.467" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="46" y1="56.928" x2="27.500" y2="88.971" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="44.343" y1="55.657" x2="18.180" y2="81.820" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="43.072" y1="54" x2="11.029" y2="72.5" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="42.273" y1="52.071" x2="6.533" y2="61.647" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="42" y1="50" x2="5" y2="50" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="42.273" y1="47.929" x2="6.533" y2="38.353" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="43.072" y1="46" x2="11.029" y2="27.5" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="44.343" y1="44.343" x2="18.180" y2="18.180" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="46" y1="43.072" x2="27.5" y2="11.029" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="47.929" y1="42.273" x2="38.353" y2="6.533" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="50" y1="42" x2="50" y2="5" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="52.071" y1="42.273" x2="61.647" y2="6.533" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="54" y1="43.072" x2="72.5" y2="11.029" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="55.657" y1="44.343" x2="81.820" y2="18.180" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="56.928" y1="46" x2="88.971" y2="27.500" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <line x1="57.727" y1="47.929" x2="93.467" y2="38.353" stroke="url(#chakraGradient)" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="url(#chakraGradient)" strokeWidth="0.5" opacity="0.5"/>
        </svg>
      </div>
      {/* 1. HERO SECTION */}
      <section className="hero-new">
        <h1 className="hero-title">
          <span className="text-viksit">Viksit</span>
          <span className="text-bharat">Bharat</span>
        </h1>
        <h2 className="hero-subtitle">{t('homeSubtitle') ? t('homeTitle1') + ' ' + t('homeTitle2') : 'Empowering Citizens. Transforming Governance.'}</h2>
        <p className="hero-desc">
          {t('homeSubtitle') || 'Report issues, discover schemes, and be the change your community needs.'}
        </p>
        <div className="hero-actions">
          <button onClick={handleGetStarted} className="btn-get-started glow-orange">
            {t('homeBtnStart') || 'Get Started'} <ArrowRight size={18} />
          </button>
          <Link to="/schemes" className="btn-explore glow-green">
            <Search size={18} /> {t('homeBtnExplore') || 'Explore Schemes'}
          </Link>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className="section-container">
        <span className="section-badge">Features</span>
        <h2 className="section-heading">{t('homeEverything') || 'Everything You Need'}</h2>
        <p className="section-subheading">{t('homeEverythingSub') || 'A comprehensive platform designed to bridge the gap between citizens and governance.'}</p>
        
        <div className="features-grid-new">
          <div className="feature-box">
            <div className="feature-icon-square icon-orange glow-orange icon-glow"><AlertTriangle size={24} /></div>
            <h3>{t('homeFeat1Title')}</h3>
            <p>{t('homeFeat1Desc')}</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-square icon-green glow-green icon-glow"><CheckCircle2 size={24} /></div>
            <h3>{t('homeFeat2Title')}</h3>
            <p>{t('homeFeat2Desc')}</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-square icon-orange glow-orange icon-glow"><BarChart2 size={24} /></div>
            <h3>{t('homeFeat3Title')}</h3>
            <p>{t('homeFeat3Desc')}</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-square icon-green glow-green icon-glow"><MessageSquare size={24} /></div>
            <h3>{t('homeFeat4Title') || 'AI Chatbot Assistant'}</h3>
            <p>{t('homeFeat4Desc') || 'Get instant answers to civic queries with our intelligent multilingual chatbot.'}</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-square icon-orange glow-orange icon-glow"><Mic size={24} /></div>
            <h3>{t('homeFeat5Title') || 'Voice Input Support'}</h3>
            <p>{t('homeFeat5Desc') || 'Use voice commands in your preferred language for hands-free interaction.'}</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-square icon-green glow-green icon-glow"><ShieldCheck size={24} /></div>
            <h3>{t('homeFeat6Title') || 'Secure & Transparent'}</h3>
            <p>{t('homeFeat6Desc') || 'Government-grade security with full transparency in complaint resolution.'}</p>
          </div>
        </div>
      </section>

      {/* 3. IMPACT SECTION */}
      <section className="section-container" style={{ paddingTop: '2rem' }}>
        <span className="section-badge">Impact</span>
        <h2 className="section-heading">{t('homeImpact') || 'Making a Difference'}</h2>
        
        <div className="impact-grid" style={{ marginTop: '3rem' }}>
          <div className="impact-card">
            <div className="feature-icon-square icon-orange"><Users size={28} /></div>
            <div className="impact-num">50,000+</div>
            <div className="impact-label">{t('homeStat1') || 'Active Citizens'}</div>
          </div>
          <div className="impact-card">
            <div className="feature-icon-square icon-green"><CheckCircle size={28} /></div>
            <div className="impact-num">12,000+</div>
            <div className="impact-label">{t('homeStat2') || 'Issues Resolved'}</div>
          </div>
          <div className="impact-card">
            <div className="feature-icon-square icon-orange"><BookOpen size={28} /></div>
            <div className="impact-num">250+</div>
            <div className="impact-label">{t('homeStat3') || 'Govt Schemes'}</div>
          </div>
          <div className="impact-card">
            <div className="feature-icon-square icon-green"><Building size={28} /></div>
            <div className="impact-num">180+</div>
            <div className="impact-label">{t('homeStat4') || 'Cities Covered'}</div>
          </div>
        </div>
      </section>

      {/* 4. PROCESS / TIMELINE SECTION */}
      <section className="section-container" style={{ paddingBottom: '4rem' }}>
        <span className="section-badge" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>Process</span>
        <h2 className="section-heading">{t('homeHowWorks') || 'How It Works'}</h2>
        <p className="section-subheading">{t('homeHowWorksSub') || 'Four simple steps to make your voice heard.'}</p>

        <div className="process-timeline">
          <div className="process-line"></div>
          
          <div className="process-step">
            <div className="step-icon icon-orange glow-orange icon-glow">
              <UserPlus size={32} />
              <div className="step-number">1</div>
            </div>
            <h4>{t('homeProcess1') || 'Register'}</h4>
            <p>{t('homeProcess1Desc') || 'Sign up with your mobile number via OTP verification'}</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon icon-green glow-green icon-glow">
              <FileText size={32} />
              <div className="step-number">2</div>
            </div>
            <h4>{t('homeProcess2') || 'Report Issue'}</h4>
            <p>{t('homeProcess2Desc') || 'Submit civic complaints with photos, location and category'}</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon icon-orange glow-orange icon-glow">
              <Search size={32} />
              <div className="step-number">3</div>
            </div>
            <h4>{t('homeProcess3') || 'Track Progress'}</h4>
            <p>{t('homeProcess3Desc') || 'Monitor real-time status updates on your complaints'}</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon icon-green glow-green icon-glow">
              <CheckCircle2 size={32} />
              <div className="step-number">4</div>
            </div>
            <h4>{t('homeProcess4') || 'Resolution'}</h4>
            <p>{t('homeProcess4Desc') || 'Get notified when your issue is resolved by authorities'}</p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Building2 size={24} className="logo-icon" />
              <span>Viksit Bharat</span>
            </div>
            <p>Bridging the gap between citizens and governance through technology.</p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/report">Report Issue</Link></li>
              <li><Link to="/admin/dashboard">Admin Panel</Link></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:support@viksitbharat.gov.in">support@viksitbharat.gov.in</a></li>
              <li><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toll Free: 1800-XXX-XXXX</p></li>
              <li><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>New Delhi, India</p></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
