import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader, MapPin, Camera, Image as ImageIcon, Send, LocateFixed, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { addRequest } from '../utils/indexedDB';

const Report = () => {
  const { isAuthenticated, API_URL, token } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Location state
  const [address, setAddress] = useState('');
  const [addressObj, setAddressObj] = useState({ state: '', district: '', city: '', area: '' });

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const speakAndMapField = (promptText, onTranscriptResult, onComplete) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('reportSpeechNotSupported'));
      return;
    }

    setTranscript(promptText);
    
    const synth = window.speechSynthesis;
    const targetLang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN' }[language] || 'en-IN';
    const utterance = new SpeechSynthesisUtterance(promptText);
    utterance.lang = targetLang;
    
    const voices = synth.getVoices();
    if (voices.length > 0) {
      const exactVoice = voices.find(v => v.lang === targetLang || v.lang === targetLang.replace('-', '_') || v.lang === language || v.lang.startsWith(language));
      if (exactVoice) {
         utterance.voice = exactVoice;
      } else {
         const enVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('English'));
         if (enVoice) utterance.voice = enVoice;
      }
    }
    
    utterance.onend = () => {
      const recognition = new SpeechRecognition();
      recognition.lang = targetLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (e) => {
        const resultText = e.results[0][0].transcript;
        onTranscriptResult(resultText);
        setIsListening(false);
        if (onComplete) {
            setTimeout(onComplete, 800);
        } else {
            setTranscript('');
        }
      };
      
      recognition.onerror = (e) => {
        console.error("Speech error", e.error);
        setIsListening(false);
        setTranscript('');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (!onComplete) setTranscript('');
      };
      
      recognition.start();
    };
    
    synth.speak(utterance);
  };

  const startSequentialVoice = () => {
    if (isListening || transcript) return;
    setError('');
    
    // Step 1: Title
    speakAndMapField(t('promptRepTitle'), (res) => setTitle(res), () => {
      // Step 2: Category
      speakAndMapField(t('promptRepCategory'), (res) => {
        const cat = res.toLowerCase();
        if (cat.includes('road') || cat.includes('pothole') || cat.includes('सड़क') || cat.includes('రోడ్డు')) setIssueType('Roads & Potholes');
        else if (cat.includes('electric') || cat.includes('power') || cat.includes('बिजली') || cat.includes('విద్యుత్')) setIssueType('Electricity & Power');
        else if (cat.includes('water') || cat.includes('sanitation') || cat.includes('पानी') || cat.includes('నీరు')) setIssueType('Water & Sanitation');
        else if (cat.includes('garbage') || cat.includes('waste') || cat.includes('कचरा') || cat.includes('చెత్త')) setIssueType('Garbage & Waste');
        else setIssueType('Other');
      }, () => {
        // Step 3: Description
        speakAndMapField(t('promptRepDesc'), (res) => {
          setDescription(res);
          setTranscript('');
          
          speakAndMapField("Please specify your location, like your area and city.", (locRes) => {
            setAddress(locRes);
            setTranscript('');

            const endTargetLang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN' }[language] || 'en-IN';
            const endUtterance = new SpeechSynthesisUtterance(t('promptComplete'));
            endUtterance.lang = endTargetLang;
            
            const endVoices = window.speechSynthesis.getVoices();
            if (endVoices.length > 0) {
              const endExactVoice = endVoices.find(v => v.lang === endTargetLang || v.lang === endTargetLang.replace('-', '_') || v.lang === language || v.lang.startsWith(language));
              if (endExactVoice) {
                endUtterance.voice = endExactVoice;
              } else {
                const enVoice = endVoices.find(v => v.lang.includes('en-IN') || v.name.includes('English'));
                if (enVoice) endUtterance.voice = enVoice;
              }
            }
            window.speechSynthesis.speak(endUtterance);
          });
        });
      });
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim() || !issueType || !description.trim() || !address.trim()) {
      setError(t('reportErrFields'));
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        title,
        issueType,
        description,
        address: address.trim(),
        state: addressObj.state,
        district: addressObj.district,
        city: addressObj.city,
        area: addressObj.area,
        imageUrl: imagePreview, // Send Base64 image payload directly to API
        beforeImage: imagePreview // Explicitly map as before proof
      };

      if (!navigator.onLine) {
        await addRequest({
          id: "offline_" + Date.now(),
          type: "complaint",
          data: payload,
          status: "Submitted",
          source: "offline"
        });
        setSuccessMsg(t('reportSuccess'));
        setTimeout(() => navigate('/complaints'), 1500);
        return;
      }

      await axios.post(`${API_URL}/complaints`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccessMsg(t('reportSuccess'));
      setTimeout(() => navigate('/complaints'), 1500);

    } catch (err) {
      if (!err.response && !navigator.onLine) {
         // Network error intercept
         await addRequest({
            id: "offline_" + Date.now(),
            type: "complaint",
            data: payload,
            status: "Submitted",
            source: "offline"
         });
         setSuccessMsg(t('reportSuccess'));
         setTimeout(() => navigate('/complaints'), 1500);
      } else {
         setError(err.response?.data?.error || t('reportErrSubmit'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', backgroundColor: 'var(--card-bg)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--bg-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#F97316' }}>
            <Camera size={30} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{t('dashReportLabel')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('dashReportDesc')}</p>
        </div>

        {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>{error}</div>}
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#15803d', marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#dcfce3', borderRadius: '8px', fontWeight: 600 }}>
            <MessageCircle size={20} color="#16A34A" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Voice Input Block */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={startSequentialVoice} 
            disabled={isListening || transcript || loading || successMsg}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '1rem 2rem', backgroundColor: isListening ? '#fef2f2' : '#f0fdf4', color: isListening ? '#ef4444' : '#16A34A', border: `2px solid ${isListening ? '#fca5a5' : '#bbf7d0'}`, borderRadius: '999px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
          >
            {(isListening || transcript) ? <Loader size={24} className="animate-spin" /> : <Mic size={24} />}
            {transcript ? `${t('assistant')} ${transcript}` : ((isListening || transcript) ? t('reportListening') : t('fillVoice'))}
          </button>
        </div>

        {/* Location Editable Field */}
        <div style={{ marginBottom: '1.5rem' }}>
           <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>
             <span>{t('reportLocLabel')} <span style={{ color: '#EF4444' }}>*</span></span>
           </label>
           <div style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)', overflow: 'hidden' }}>
             <div style={{ padding: '0.85rem', color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)', backgroundColor: 'transparent' }}><MapPin size={20} /></div>
             <input 
               id="locationInput"
               type="text" 
               value={address}
               onChange={(e) => setAddress(e.target.value)}
               placeholder="Enter your area, street, city (e.g. Pearl Village, Hyderabad)"
               style={{ flex: 1, padding: '0.85rem', border: 'none', outline: 'none', fontSize: '1rem', width: '100%', background: 'transparent' }}
               disabled={loading || successMsg}
               required
             />
           </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('reportTitleLabel')} <span style={{color: '#EF4444'}}>*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('reportTitlePlaceholder')}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
              disabled={loading || successMsg}
              required
            />
          </div>

          {/* Issue Type Dropdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('reportCatLabel')} <span style={{color: '#EF4444'}}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select 
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', appearance: 'none', cursor: 'pointer', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }}
                disabled={loading || successMsg}
                required
              >
                <option value="" disabled>{t('reportCatPlaceholder')}</option>
                <option value="Roads & Potholes">{t('catRoads')}</option>
                <option value="Electricity & Power">{t('catElectricity')}</option>
                <option value="Water & Sanitation">{t('catWater')}</option>
                <option value="Garbage & Waste">{t('catGarbage')}</option>
                <option value="Other">{t('catOther')}</option>
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              {t('reportDescLabel')} <span style={{color: '#EF4444'}}>*</span>
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('reportDescPlaceholder')}
              rows="4"
              style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
              disabled={loading || successMsg}
              required
            ></textarea>
          </div>

          {/* Image Upload/Capture */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('reportAttachImg')}</label>
            
            {!imagePreview ? (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9fafb', transition: 'all 0.2s' }}>
                <ImageIcon size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('reportClickUpload')}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{t('reportCameraTip')}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                  disabled={loading || successMsg}
                />
              </label>
            ) : (
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'cover' }} />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                  {t('reportRetake')}
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-full" disabled={loading || successMsg} style={{ display: 'flex', gap: '8px', justifyContent: 'center', backgroundColor: '#F97316', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px', border: 'none' }}>
            {loading ? <Loader size={22} className="animate-spin" /> : <Send size={22} />}
            {loading ? t('reportSubmitting') : t('reportSubmitBtn')}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default Report;
