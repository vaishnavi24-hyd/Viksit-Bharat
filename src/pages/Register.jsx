import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mic, User, Phone, Calendar, MapPin, Briefcase, ChevronDown, MessageCircle, Loader, LocateFixed } from 'lucide-react';
import { getCurrentLocation } from '../utils/location';

const Register = () => {
  const { login, isAuthenticated, API_URL } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState('');
  
  // Location detection state
  const [isLocating, setIsLocating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState(locationState?.mobile || '');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    // Auto-detect location on mount
    detectLocation();
  }, [isAuthenticated, navigate]);

  const detectLocation = async () => {
    setIsLocating(true);
    setLocation("Detecting your location...");
    
    try {
      const locData = await getCurrentLocation();
      setLocation(locData.address);
    } catch (err) {
      console.error("Location error:", err);
      setLocation("");
      setError("Location access denied. Please enable GPS.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!age) {
      setError('Please enter your age.');
      return;
    }
    if (!location.trim()) {
      setError('Please provide your location.');
      return;
    }
    if (!occupation) {
      setError('Please select your occupation.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/register`, { 
        mobile, name, age: Number(age), location, occupation, preferredLanguage 
      });
      
      setSuccessMsg('Registration successful');
      
      // Save tokens so ProtectedRoute allows us in
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role || 'user');
      
      setTimeout(() => {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. User might already exist.');
      setLoading(false);
    }
  };

  // Sequential Voice Filling Logic
  const speakAndMapField = (promptText, onTranscriptResult, onComplete) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser doesn't support Speech Recognition.");
      return;
    }

    setVoicePrompt(promptText);
    
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(promptText);
    const targetLang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN' }[language] || 'en-IN';
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
        const transcript = e.results[0][0].transcript;
        onTranscriptResult(transcript);
        setIsListening(false);
        if (onComplete) {
            // Slight delay before next question
            setTimeout(onComplete, 800);
        } else {
            setVoicePrompt('');
        }
      };
      
      recognition.onerror = (e) => {
        console.error("Speech error", e.error);
        setIsListening(false);
        setVoicePrompt('');
        setError("Voice input failed or timed out. Please try again or type manually.");
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (!onComplete) setVoicePrompt('');
      };
      
      recognition.start();
    };
    
    synth.speak(utterance);
  };

  const startSequentialVoice = () => {
    if (isListening || voicePrompt) return;
    setError('');
    
    // Step 1: Name
    speakAndMapField(t('promptName'), (transcript) => {
      setName(transcript.replace(/\.$/, '').trim());
    }, () => {
      // Step 2: Mobile
      speakAndMapField(t('promptMobile'), (transcript) => {
        const digits = transcript.replace(/\D/g, '').slice(0, 10);
        if (digits) setMobile(digits);
      }, () => {
        // Step 3: Age
        speakAndMapField(t('promptAge'), (transcript) => {
          const matchedAge = transcript.match(/\d+/);
          if (matchedAge) setAge(matchedAge[0]);
        }, () => {
          // Step 4: Occupation
          speakAndMapField(t('promptOccupation'), (transcript) => {
            const occ = transcript.toLowerCase();
            if(occ.includes('student') || occ.includes('छात्र') || occ.includes('విద్యార్థి')) setOccupation('Student');
            else if(occ.includes('farmer') || occ.includes('किसान') || occ.includes('రైతు')) setOccupation('Farmer');
            else if(occ.includes('business') || occ.includes('व्यापार') || occ.includes('వ్యాపారం')) setOccupation('Business');
            else if(occ.includes('service') || occ.includes('नौकरी') || occ.includes('ఉద్యోగం')) setOccupation('Service');
            else setOccupation('Other');
            
            setVoicePrompt('');
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

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#F97316', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
            <User size={30} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{t('registerTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('registerSubtext')}
          </p>
        </div>

        {/* Voice Button */}
        <button 
          type="button" 
          onClick={startSequentialVoice} 
          disabled={isListening || voicePrompt}
          className="btn w-full" 
          style={{ backgroundColor: '#8B5CF6', color: 'white', marginBottom: '1.5rem', display: 'flex', gap: '8px', fontSize: '1rem', padding: '0.85rem', borderRadius: '8px', border: 'none' }}
        >
          {(isListening || voicePrompt) ? <Loader size={20} className="animate-spin" /> : <Mic size={20} />}
          {voicePrompt ? `${t('assistant')}: ${voicePrompt}` : t('fillVoice')}
        </button>

        {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#15803d', marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#dcfce3', borderRadius: '8px', fontWeight: 600 }}>
            <MessageCircle size={20} color="#16A34A" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          
          {/* Full Name */}
          <div style={{ marginBottom: '1.5rem' }}>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
               {t('fullName')} <span style={{ color: '#EF4444' }}>*</span>
             </label>
             <div className="input-with-icon" style={{ borderColor: voicePrompt.includes(t('fullName')) ? '#8B5CF6' : '#d1d5db', boxShadow: voicePrompt.includes(t('fullName')) ? '0 0 0 2px rgba(139,92,246,0.2)' : 'none' }}>
               <div className="input-icon-left"><User size={20} /></div>
               <input 
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder={t('enterFullName')}
                 className="input-field"
                 required
               />
             </div>
          </div>

          {/* Mobile Number */}
          <div style={{ marginBottom: '1.5rem' }}>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
               {t('mobileNum')} <span style={{ color: '#EF4444' }}>*</span>
             </label>
             <div className="input-with-icon" style={{ borderColor: voicePrompt.includes(t('mobileNum')) ? '#8B5CF6' : '#d1d5db', boxShadow: voicePrompt.includes(t('mobileNum')) ? '0 0 0 2px rgba(139,92,246,0.2)' : 'none' }}>
               <div className="input-icon-left" style={{ display: 'flex', gap: '4px' }}>
                 <Phone size={20} />
                 <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>91</span>
               </div>
               <input 
                 type="tel" 
                 value={mobile}
                 onChange={(e) => setMobile(e.target.value)}
                 placeholder={t('enterMobile')}
                 className="input-field"
                 maxLength={10}
                 required
               />
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
               {t('welcomeMsgTip')}
             </p>
          </div>

          {/* Age */}
          <div style={{ marginBottom: '1.5rem' }}>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
               {t('age')} <span style={{ color: '#EF4444' }}>*</span>
             </label>
             <div className="input-with-icon" style={{ borderColor: voicePrompt.includes(t('age')) ? '#8B5CF6' : '#d1d5db', boxShadow: voicePrompt.includes(t('age')) ? '0 0 0 2px rgba(139,92,246,0.2)' : 'none' }}>
               <div className="input-icon-left"><Calendar size={20} /></div>
               <input 
                 type="number" 
                 value={age}
                 onChange={(e) => setAge(e.target.value)}
                 placeholder={t('enterAge')}
                 className="input-field"
                 required
               />
             </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '1.5rem' }}>
             <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
               <span>{t('location')} <span style={{ color: '#EF4444' }}>*</span></span>
               <button type="button" onClick={detectLocation} style={{ background: 'none', border: 'none', color: '#F97316', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                 {isLocating ? <Loader size={14} className="animate-spin" /> : <LocateFixed size={14} />} {t('autoDetect')}
               </button>
             </label>
             <div className="input-with-icon">
               <div className="input-icon-left"><MapPin size={20} /></div>
               <input 
                 type="text" 
                 value={location}
                 onChange={(e) => setLocation(e.target.value)}
                 placeholder={t('enterCity')}
                 className="input-field"
                 required
               />
             </div>
          </div>

          {/* Occupation */}
          <div style={{ marginBottom: '1.5rem' }}>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
               {t('occupation')} <span style={{ color: '#EF4444' }}>*</span>
             </label>
             <div className="input-with-icon" style={{ borderColor: voicePrompt.includes(t('occupation')) ? '#8B5CF6' : '#d1d5db', boxShadow: voicePrompt.includes(t('occupation')) ? '0 0 0 2px rgba(139,92,246,0.2)' : 'none' }}>
               <div className="input-icon-left"><Briefcase size={20} /></div>
               <select 
                 value={occupation}
                 onChange={(e) => setOccupation(e.target.value)}
                 className="input-field"
                 style={{ appearance: 'none', cursor: 'pointer' }}
                 required
               >
                 <option value="" disabled>{t('selectOcc')}</option>
                 <option value="Student">{t('student')}</option>
                 <option value="Farmer">{t('farmer')}</option>
                 <option value="Business">{t('business')}</option>
                 <option value="Service">{t('service')}</option>
                 <option value="Other">{t('other')}</option>
               </select>
               <div style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                 <ChevronDown size={20} />
               </div>
             </div>
          </div>

          {/* Preferred Language */}
          <div style={{ marginBottom: '2.5rem' }}>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
               {t('prefLang')} <span style={{ color: '#EF4444' }}>*</span>
             </label>
             <div className="input-with-icon">
               <select 
                 value={preferredLanguage}
                 onChange={(e) => setPreferredLanguage(e.target.value)}
                 className="input-field"
                 style={{ appearance: 'none', paddingLeft: '1rem', cursor: 'pointer' }}
                 required
               >
                 <option value="English">{t('english')}</option>
                 <option value="Hindi">{t('hindi')}</option>
                 <option value="Telugu">{t('telugu')}</option>
                 <option value="Tamil">{t('tamil')}</option>
                 <option value="Kannada">{t('kannada')}</option>
                 <option value="Marathi">{t('marathi')}</option>
                 <option value="Bengali">{t('bengali')}</option>
               </select>
               <div style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                 <ChevronDown size={20} />
               </div>
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
               {t('prefLangTip')}
             </p>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ display: 'flex', gap: '8px', justifyContent: 'center', backgroundColor: '#F97316', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px', border: 'none' }}>
            {loading ? <Loader size={22} className="animate-spin" /> : <MessageCircle size={22} />}
            {loading ? t('registering') : t('registerBtn')}
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            {t('registerAgree')}
          </p>

        </form>
      </div>
    </div>
  );
};

export default Register;
