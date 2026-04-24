import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, API_URL } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const DEMO_MODE = true; // Add Demo Mode flag for UI

  // Steps: 1 (Mobile), 2 (OTP)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const role = localStorage.getItem('role');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'official') {
        navigate('/official/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { mobile });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { mobile, otp });
      const { token, role, user } = res.data;
      
      localStorage.setItem('role', role);
      localStorage.setItem('token', token);
      
      login(token, user);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'official') {
        navigate('/official/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <h2 className="text-center" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{t('loginTitle')}</h2>
            <p className="text-center text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {t('loginSubtext')}
            </p>
            
            {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
            
            {DEMO_MODE && (
              <div style={{ backgroundColor: '#fff7ed', color: '#ea580c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #ffedd5', fontWeight: 500 }}>
                Demo Mode Enabled – OTP is simulated. Any 10-digit number works.
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{t('mobileNum')}</label>
              <input 
                type="tel" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
                placeholder="e.g. 9876543210"
                style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ display: 'flex', gap: '8px', justifyContent: 'center', borderRadius: '8px', padding: '1rem', fontSize: '1.05rem', backgroundColor: '#F97316', border: 'none' }}>
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Sending OTP...' : t('sendOtp')}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('newUser')} </span>
              <Link to="/register" style={{ color: '#F97316', fontWeight: 600, fontSize: '0.95rem' }}>{t('registerHere')}</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <h2 className="text-center">{t('verifyOtpTitle')}</h2>
            <p className="text-center text-secondary" style={{ marginBottom: '0.5rem' }}>
              Enter the OTP sent to +91 {mobile}
            </p>
            <div style={{ backgroundColor: '#f0fdf4', color: '#16A34A', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>
              OTP is sent via secure verification system. In demo mode, only registered numbers can receive OTP.
            </div>
            
            {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
            
            {DEMO_MODE && (
              <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #fee2e2', fontWeight: 'bold' }}>
                Demo OTP: 123456
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Enter the 6-digit OTP sent to your mobile number</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder={DEMO_MODE ? "123456" : "------"}
                maxLength={6}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1.25rem', letterSpacing: '4px', textAlign: 'center' }}
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ display: 'flex', gap: '8px', justifyContent: 'center', borderRadius: '8px', padding: '0.85rem' }}>
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Verifying OTP...' : t('verifyOtpBtn')}
            </button>
            
            <button type="button" onClick={() => setStep(1)} className="btn btn-outline w-full" style={{ marginTop: '0.75rem', border: 'none', borderRadius: '8px' }} disabled={loading}>
              {t('changeMobile')}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;
