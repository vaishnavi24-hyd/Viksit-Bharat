import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FileCheck, AlertTriangle, ShieldCheck, CreditCard, Landmark, FileBadge, Camera, CheckCircle2 } from 'lucide-react';

const VerifyDocuments = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();
    
    const [docs, setDocs] = useState({
        aadhaar: false,
        bank: false,
        incomeCaste: false,
        photos: false
    });
    
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }
    
    if (!state || !state.scheme) {
        return (
            <div className="page-container" style={{ padding: '3rem 1rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ color: 'var(--text-dark)' }}>{t('verifyInvalid')}</h2>
                <button onClick={() => navigate('/schemes')} className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('verifyReturnScheme')}</button>
            </div>
        );
    }
    
    const scheme = state.scheme;
    
    const checklistItems = [
      { id: 'aadhaar', label: t('docAadhaarLabel'), icon: CreditCard, guidance: t('docAadhaarGuide') },
      { id: 'bank', label: t('docBankLabel'), icon: Landmark, guidance: t('docBankGuide') },
      { id: 'incomeCaste', label: t('docIncomeLabel'), icon: FileBadge, guidance: t('docIncomeGuide') },
      { id: 'photos', label: t('docPhotoLabel'), icon: Camera, guidance: t('docPhotoGuide') }
    ];
    
    const handleCheckbox = (id) => {
        setDocs(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const checkedCount = Object.values(docs).filter(Boolean).length;
    const totalCount = checklistItems.length;
    const progressPercentage = (checkedCount / totalCount) * 100;
    const isAllChecked = checkedCount === totalCount;
    
    return (
        <div className="page-container" style={{ padding: '3rem 1rem', maxWidth: '750px', margin: '0 auto', backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 70px)' }}>
            <div className="card" style={{ padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: isAllChecked ? '#dcfce3' : '#fff7ed', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: isAllChecked ? '#16A34A' : '#F97316', transition: 'all 0.3s' }}>
                        {isAllChecked ? <CheckCircle2 size={32} /> : <FileCheck size={30} />}
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{t('verifySmartTitle')}</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.05rem', lineHeight: '1.5' }}>{t('verifySmartSub')} <br/><strong style={{ color: 'var(--text-dark)' }}>{scheme.name}</strong>.</p>
                </div>
                
                {/* Progress Indicator */}
                <div style={{ marginBottom: '2.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                     <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{t('verifyReadiness')}</span>
                     <span style={{ fontWeight: 700, color: isAllChecked ? '#16A34A' : '#F97316' }}>{checkedCount} / {totalCount} {t('verifyReady')}</span>
                   </div>
                   <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '10px', borderRadius: '999px', overflow: 'hidden' }}>
                     <div style={{ width: `${progressPercentage}%`, backgroundColor: isAllChecked ? '#16A34A' : '#F97316', height: '100%', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                   </div>
                </div>
                
                {/* Missing Notification */}
                {!isAllChecked && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', display: 'flex', gap: '12px', marginBottom: '2rem', alignItems: 'center' }}>
                      <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0 }} />
                      <p style={{ color: '#991b1b', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>
                          {t('verifyActionReq')}
                      </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
                    {checklistItems.map(item => {
                        const isChecked = docs[item.id];
                        return (
                          <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1.2rem', border: '1.5px solid', borderColor: isChecked ? '#16A34A' : '#fca5a5', borderRadius: '12px', cursor: 'pointer', backgroundColor: isChecked ? '#f0fdf4' : '#fef2f2', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <input type="checkbox" checked={isChecked} onChange={() => handleCheckbox(item.id)} style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#16A34A' }} />
                                <item.icon size={22} color={isChecked ? '#15803d' : '#ef4444'} style={{ flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, color: isChecked ? '#15803d' : '#991b1b', fontSize: '1.05rem', flex: 1 }}>{item.label}</span>
                            </label>
                            
                            {/* Smart Guidance Section */}
                            {!isChecked && (
                              <div style={{ marginLeft: '40px', marginTop: '0.5rem', padding: '0.85rem 1rem', backgroundColor: 'var(--card-bg)', borderLeft: '3px solid #ef4444', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.9rem', color: '#ef4444', margin: 0, lineHeight: '1.4' }}>
                                  <strong style={{ color: '#991b1b' }}>{t('verifyHowTo')}</strong> {item.guidance}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                    })}
                </div>
                
                <button 
                  onClick={() => window.open(scheme.officialLink, '_blank')} 
                  disabled={!isAllChecked} 
                  className="btn w-full" 
                  style={{ display: 'flex', gap: '8px', justifyContent: 'center', backgroundColor: isAllChecked ? '#16A34A' : '#e5e7eb', padding: '1.1rem', fontSize: '1.1rem', borderRadius: '12px', border: 'none', transition: 'all 0.3s', cursor: isAllChecked ? 'pointer' : 'not-allowed', color: isAllChecked ? '#fff' : 'var(--text-muted)', fontWeight: 600 }}
                >
                  <ShieldCheck size={22} />
                  {isAllChecked ? t('verifyProceed') : t('verifyAwaiting')}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>{t('verifyReturnLib')}</button>
                </div>
            </div>
        </div>
    );
};
export default VerifyDocuments;
