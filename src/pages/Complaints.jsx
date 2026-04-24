import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Loader, MapPin, Calendar, Activity, ChevronDown, ChevronUp, Image as ImageIcon, Volume2, Search, Clock } from 'lucide-react';
import ImageModal from '../components/ImageModal';
import { getAllRequests } from '../utils/indexedDB';

// Timeline Component
const Timeline = ({ currentStatus, t }) => {
  const steps = ['Submitted', 'In Progress', 'Resolved'];
  
  const currentIndex = steps.indexOf(currentStatus);
  if (currentIndex === -1 && currentStatus === 'Rejected') {
    return <div style={{ color: '#EF4444', fontWeight: 600, padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>{t('compStatusRejected')}</div>;
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
         {/* Background line */}
         <div style={{ position: 'absolute', top: '12px', left: '20px', right: '20px', height: '4px', backgroundColor: '#e5e7eb', zIndex: 1 }}></div>
         
         {/* Active Line */}
         {currentIndex > 0 && (
           <div style={{ position: 'absolute', top: '12px', left: '20px', width: `calc(${(currentIndex / 2) * 100}% - 40px)`, height: '4px', backgroundColor: currentStatus === 'Resolved' ? '#16A34A' : '#F97316', zIndex: 2, transition: 'width 0.4s ease' }}></div>
         )}

         {steps.map((step, index) => {
           const isActive = currentIndex >= index;
           const isCurrent = currentIndex === index;
           const iconColor = currentStatus === 'Resolved' && isActive ? '#16A34A' : isActive ? '#F97316' : '#f9fafb';
           const borderColor = currentStatus === 'Resolved' && isActive ? '#16A34A' : isActive ? '#F97316' : '#d1d5db';
           
           return (
             <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '33%' }}>
               <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: iconColor, border: `3px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s ease' }}>
                  {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff' }}></div>}
               </div>
               <span style={{ fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: isCurrent ? 700 : 500, color: isActive ? 'var(--text-dark)' : 'var(--text-muted)', textAlign: 'center' }}>{t(`comp${step.replace(' ', '')}`)}</span>
             </div>
           );
         })}
      </div>
    </div>
  );
};


const Complaints = () => {
  const { isAuthenticated, API_URL } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [isAuthenticated, navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let onlineData = [];
      try {
        if (navigator.onLine) {
          const res = await axios.get(`${API_URL}/complaints/user`);
          onlineData = res.data;
        }
      } catch (e) {
        console.error("Online fetch failed", e);
      }
      
      const offlineReqs = await getAllRequests() || [];
      const offlineComplaints = offlineReqs
        .filter(req => req.type === 'complaint' || req.type === 'sos')
        .map(req => ({
          _id: req.id || ('offline_' + Date.now()),
          title: req.data.title || req.data.category || 'Emergency SOS',
          description: req.data.description || 'Emergency SOS dispatch',
          type: req.type === 'sos' ? 'Emergency' : 'Standard',
          issueType: req.data.issueType,
          category: req.data.category,
          status: 'Submitted',
          address: req.data.address || 'Location Stored Offline',
          latitude: req.data.latitude,
          longitude: req.data.longitude,
          createdAt: req.createdAt || new Date().toISOString(),
          source: 'offline',
          imageUrl: req.data.imageUrl,
          beforeImage: req.data.beforeImage
        }));

      let allComplaints = [...offlineComplaints, ...onlineData];
      
      const optimistic = location.state?.optimisticComplaint;
      if (optimistic) {
        // Clear it from history so refresh doesn't duplicate indefinitely
        window.history.replaceState({}, document.title);
        allComplaints = [optimistic, ...allComplaints];
      }

      setComplaints(allComplaints);
    } catch (err) {
      setError(t('compErrFetch'));
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (id, feedback) => {
    try {
      await axios.put(`${API_URL}/complaints/${id}/feedback`, { feedback });
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit feedback');
    }
  };

  const getStatusBadge = (status, source) => {
    if (source === 'offline' || status === 'Pending Sync') {
      return <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> ⏳ Pending Sync</span>;
    }
    switch (status) {
      case 'Submitted':
        return <span style={{ backgroundColor: '#f3f4f6', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block' }}>{t('compSubmitted')}</span>;
      case 'In Progress':
        return <span style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block' }}>{t('compInProgress')}</span>;
      case 'Resolved':
        return <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block' }}>{t('compResolved')}</span>;
      case 'Rejected':
        return <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block' }}>{t('compRejected')}</span>;
      default:
        return null;
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const handleReadStatus = (complaint) => {
    window.speechSynthesis.cancel();
    const statusText = t(`comp${complaint.status.replace(' ', '')}`);
    const textToRead = language === 'en' 
      ? `${complaint.title}. ${t('statusIs')} ${statusText}.` 
      : `${complaint.title} ${t('statusIs')} ${statusText}.`; 
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const targetLang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN' }[language] || 'en-IN';
    utterance.lang = targetLang;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const exactVoice = voices.find(v => v.lang === targetLang || v.lang === targetLang.replace('-', '_') || v.lang === language || v.lang.startsWith(language));
      if (exactVoice) {
        utterance.voice = exactVoice;
      } else {
         const enVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('English'));
         if (enVoice) utterance.voice = enVoice;
      }
    }
    
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={40} className="animate-spin" color="#F97316" />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 70px)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#16A34A', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Activity size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>{t('compTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('compSubtext')}</p>
        </div>
      </div>

      {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>{error}</div>}

      {complaints.length === 0 && !error ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '16px' }}>
          <div style={{ backgroundColor: '#f3f4f6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-muted)' }}>
            <Activity size={40} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{t('compNoFound')}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('compNoReported')}</p>
          <button onClick={() => navigate('/report')} className="btn btn-primary" style={{ backgroundColor: '#F97316', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
            {t('compReportBtn')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map((complaint) => {
            const isExpanded = expandedId === complaint._id;
            const dateStr = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            });

            return (
              <div key={complaint._id} className="card" style={{ borderRadius: '12px', overflow: 'hidden', padding: '0', transition: 'all 0.3s ease', boxShadow: isExpanded ? '0 10px 25px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)' }}>
                
                {/* Visible Header (Clickable) */}
                <div onClick={() => toggleExpand(complaint._id)} style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', backgroundColor: isExpanded ? 'var(--bg-color)' : 'var(--card-bg)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      {getStatusBadge(complaint.status, complaint.source)}
                      {complaint.type === 'Emergency' && <span style={{ backgroundColor: '#EF4444', color: 'white', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>🚨 Emergency</span>}
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {dateStr}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: complaint.type === 'Emergency' ? '#EF4444' : 'var(--text-dark)', marginBottom: '0.5rem' }}>{complaint.title}</h3>
                    {!isExpanded && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {complaint.description}
                      </p>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>

                {/* Expanded Details Content */}
                {isExpanded && (
                  <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
                    
                    {/* Status Timeline */}
                    <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 600 }}>{t('compResTrace')}</h4>
                        <button onClick={() => handleReadStatus(complaint)} style={{ background: '#F9731615', border: 'none', padding: '6px 10px', borderRadius: '6px', color: '#F97316', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                          <Volume2 size={16} /> {t('readAloud')}
                        </button>
                      </div>
                      <Timeline currentStatus={complaint.status} t={t} />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.5rem', fontWeight: 600 }}>{t('compCategory')}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{complaint.type === 'Emergency' ? complaint.category : complaint.issueType}</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.5rem', fontWeight: 600 }}>{t('compFullDesc')}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{complaint.description}</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {t('compExactLoc')}</h4>
                      <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <p style={{ color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.25rem' }}>{complaint.address}</p>
                        {(complaint.latitude && complaint.longitude) && (
                           <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('compCoordinates')} {Number(complaint.latitude).toFixed(5)}, {Number(complaint.longitude).toFixed(5)}</p>
                        )}
                      </div>
                    </div>

                    {/* Legacy or Before Evidence */}
                    {(complaint.imageUrl || complaint.beforeImage) && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={16} /> {t('compEvidence') || 'Evidence'}</h4>
                        <div 
                          onClick={() => setSelectedImage({ imageUrl: complaint.imageUrl, beforeImage: complaint.beforeImage, afterImage: complaint.afterImage })}
                          style={{ position: 'relative', cursor: 'pointer', display: 'inline-block', width: '100%', maxWidth: '300px' }}
                        >
                           <img 
                             src={complaint.beforeImage || complaint.imageUrl} 
                             alt="Before Evidence" 
                             style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db', transition: 'opacity 0.2s' }} 
                             onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                             onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                           />
                           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                             <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                               <Search size={16} /> View Evidence {complaint.afterImage && '(Before & After)'}
                             </div>
                           </div>
                        </div>
                      </div>
                    )}
                    
                    {complaint.status === 'Resolved' && !complaint.feedback && (
                      <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid #F97316' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#F97316' }}>Is your issue resolved?</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Please provide feedback so we can officially close your complaint.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button onClick={() => submitFeedback(complaint._id, 'Yes')} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', fontSize: '0.9rem' }}>Yes</button>
                          <button onClick={() => submitFeedback(complaint._id, 'No')} className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', fontSize: '0.9rem', borderColor: '#ef4444', color: '#ef4444' }}>No</button>
                        </div>
                      </div>
                    )}
                    
                    {(complaint.feedback || complaint.status === 'Closed') && (
                      <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #16A34A', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <Activity size={20} />
                         <span>Feedback submitted: <strong>{complaint.feedback || 'Yes'}</strong>. Thank you!</span>
                      </div>
                    )}

                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <ImageModal 
          images={selectedImage} 
          onClose={() => setSelectedImage(null)} 
          title="Evidence Viewer"
        />
      )}
    </div>
  );
};

export default Complaints;
