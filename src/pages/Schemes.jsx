import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader, CheckCircle2, ShieldCheck, X, FileText, ArrowRight, Library, Search, Mic, Volume2 } from 'lucide-react';
import { schemesData } from '../data/schemesData';

const Schemes = () => {
  const { isAuthenticated, user, API_URL } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Evaluation States
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [activeScheme, setActiveScheme] = useState(null);

  // Form States
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  const [gender, setGender] = useState('');
  
  // New Demographic Forms
  const [casteCategory, setCasteCategory] = useState('');
  const [stateName, setStateName] = useState('');
  const [area, setArea] = useState('');
  const [familyStatus, setFamilyStatus] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Prefill if available
    if (user?.age) setAge(user.age);
    if (user?.occupation) setOccupation(user.occupation);
  }, [isAuthenticated, navigate, user]);

  const getEligibleSchemes = (profile, allSchemes) => {
    return allSchemes.filter(scheme => {
      const e = scheme.eligibility;
      const userAge = parseInt(profile.age) || 0;
      const userIncome = parseInt(profile.income) || 0;

      // Check age
      if (userAge < e.minAge || userAge > e.maxAge) return false;

      // Check income
      if (userIncome < e.minIncome || userIncome > e.maxIncome) return false;

      // Check occupation
      if (!e.occupation.includes("All") && !e.occupation.includes("Any") && !e.occupation.includes(profile.occupation)) return false;

      // Check gender
      if (!e.gender.includes("All") && !e.gender.includes("Any") && !e.gender.includes(profile.gender)) return false;

      // Check education
      if (!e.educationLevel.includes("All") && !e.educationLevel.includes("Any") && !e.educationLevel.includes(profile.educationLevel)) return false;

      return true;
    });
  };

  const handleEligibilitySubmit = async (e) => {
    e.preventDefault();
    if (!income || !gender || !educationLevel || !casteCategory || !stateName || !area || !familyStatus || !occupation) {
      setError(t('schemesErrFields'));
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const profile = { age, occupation, income, gender, educationLevel, casteCategory, state: stateName, area, familyStatus };
      const filtered = getEligibleSchemes(profile, schemesData);
      setSchemes(filtered);
      setHasEvaluated(true);
    } catch (err) {
      setError(t('schemesErrConnect'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sequential Voice Filling Logic
  const speakAndMapField = (promptText, onTranscriptResult, onComplete) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t('schemesNoSpeech'));
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
        setError(t('schemesVoiceFailed'));
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
    
    // Step 1: Age
    speakAndMapField(t('schemesVoiceAge'), (res) => {
      const matchedAge = res.match(/\d+/);
      if (matchedAge) setAge(matchedAge[0]);
    }, () => {
      // Step 2: Occupation
      speakAndMapField(t('schemesVoiceOcc'), (res) => {
        const occ = res.toLowerCase();
        if (occ.includes('farmer') || occ.includes('agriculture')) setOccupation('Farmer');
        else if (occ.includes('student') || occ.includes('study')) setOccupation('Student');
        else if (occ.includes('business') || occ.includes('shop')) setOccupation('Business');
        else if (occ.includes('salaried') || occ.includes('employee') || occ.includes('job') || occ.includes('service')) setOccupation('Salaried Employee');
        else if (occ.includes('self')) setOccupation('Self-Employed');
        else setOccupation('Unemployed');
      }, () => {
        // Step 3: Income
        speakAndMapField(t('schemesVoiceInc'), (res) => {
          const lMatch = res.match(/(\d+)\s*lakh/i);
          if (lMatch) setIncome(String(parseInt(lMatch[1]) * 100000));
          else {
            const tMatch = res.match(/(\d+)\s*thousand/i);
            if (tMatch) setIncome(String(parseInt(tMatch[1]) * 1000));
            else {
              const numMatch = res.match(/\d+/g);
              if (numMatch) setIncome(numMatch.join(''));
            }
          }
        }, () => {
          // Step 4: Caste
          speakAndMapField(t('schemesVoiceCaste'), (res) => {
            const cas = res.toLowerCase();
            if (cas.includes('general') || cas.includes('open')) setCasteCategory('General');
            else if (cas.includes('sc') || cas.includes('st') || cas.includes('schedule') || cas.includes('dalit')) setCasteCategory('SC/ST');
            else setCasteCategory('OBC');
          }, () => {
            // Step 5: State
            speakAndMapField(t('schemesVoiceState'), (res) => {
              const text = res.toLowerCase();
              const statesMap = { 'andhra': 'Andhra Pradesh', 'arunachal': 'Arunachal Pradesh', 'assam': 'Assam', 'bihar': 'Bihar', 'chhattisgarh': 'Chhattisgarh', 'delhi': 'Delhi', 'goa': 'Goa', 'gujarat': 'Gujarat', 'haryana': 'Haryana', 'himachal': 'Himachal Pradesh', 'jharkhand': 'Jharkhand', 'karnataka': 'Karnataka', 'kerala': 'Kerala', 'madhya': 'Madhya Pradesh', 'maharashtra': 'Maharashtra', 'manipur': 'Manipur', 'meghalaya': 'Meghalaya', 'mizoram': 'Mizoram', 'nagaland': 'Nagaland', 'odisha': 'Odisha', 'punjab': 'Punjab', 'rajasthan': 'Rajasthan', 'sikkim': 'Sikkim', 'tamil nadu': 'Tamil Nadu', 'telangana': 'Telangana', 'tripura': 'Tripura', 'uttar pradesh': 'Uttar Pradesh', 'up ': 'Uttar Pradesh', 'uttarakhand': 'Uttarakhand', 'west bengal': 'West Bengal' };
              let found = false;
              for (const [key, value] of Object.entries(statesMap)) {
                if (text.includes(key)) { setStateName(value); found = true; break; }
              }
              if (!found) setStateName('Other State');
            }, () => {
              // Step 6: Area
              speakAndMapField(t('schemesVoiceArea'), (res) => {
                if (res.toLowerCase().includes('urban') || res.toLowerCase().includes('city') || res.toLowerCase().includes('town')) setArea('Urban');
                else setArea('Rural');
              }, () => {
                // Step 7: Gender
                speakAndMapField(t('schemesVoiceGender'), (res) => {
                  if (res.toLowerCase().includes('female') || res.toLowerCase().includes('woman') || res.toLowerCase().includes('girl')) setGender('Female');
                  else if (res.toLowerCase().includes('male') || res.toLowerCase().includes('man') || res.toLowerCase().includes('boy')) setGender('Male');
                  else setGender('Other');
                }, () => {
                  // Step 8: Family status
                  speakAndMapField(t('schemesVoiceFam'), (res) => {
                    const fam = res.toLowerCase();
                    if (fam.includes('bpl') || fam.includes('below poverty')) setFamilyStatus('BPL');
                    else if (fam.includes('middle') || fam.includes('middle class')) setFamilyStatus('Middle Class');
                    else setFamilyStatus('APL');
                    
                    setTranscript('');
                    const endTargetLang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN' }[language] || 'en-IN';
                    const endUtterance = new SpeechSynthesisUtterance(t('schemesVoiceDone'));
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
          });
        });
      });
    });
  };

  const getBadgeColor = (type) => {
    switch(type) {
      case 'Government': return { bg: '#dcfce3', text: '#15803d' };
      case 'Welfare': return { bg: '#fce7f3', text: '#be185d' };
      case 'Investment': return { bg: '#e0e7ff', text: '#4338ca' };
      case 'Private': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f3f4f6', text: 'var(--text-muted)' };
    }
  };

  const readSchemeFull = (scheme) => {
      window.speechSynthesis.cancel();
      const sentence = `${scheme.name}. ${scheme.description}`;
      const utterance = new SpeechSynthesisUtterance(sentence);
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

  return (
    <div className="page-container" style={{ padding: '3rem 1rem', maxWidth: '1000px', margin: '0 auto', backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 70px)' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#16A34A', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {hasEvaluated ? <Library size={26} /> : <Search size={26} />}
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
            {hasEvaluated ? t('schemesTitleFound') : t('schemesTitleFind')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {hasEvaluated ? `${schemes.length} ${t('schemesSubFound')}` : t('schemesSubFind')}
          </p>
        </div>
      </div>

      {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>{error}</div>}

      {!hasEvaluated ? (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem', borderRadius: '16px', backgroundColor: 'var(--card-bg)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
           
           {/* Voice Input Block */}
           <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
             <button 
               type="button" 
               onClick={startSequentialVoice} 
               disabled={isListening || transcript}
               style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '1rem 2rem', backgroundColor: isListening ? '#fef2f2' : '#f0fdf4', color: isListening ? '#ef4444' : '#16A34A', border: `2px solid ${isListening ? '#fca5a5' : '#bbf7d0'}`, borderRadius: '999px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
             >
               {(isListening || transcript) ? <Loader size={24} className="animate-spin" /> : <Mic size={24} />}
               {transcript ? `${t('schemesAssistant')} ${transcript}` : (isListening ? t('schemesListening') : t('schemesFillVoice'))}
             </button>
           </div>

           <form onSubmit={handleEligibilitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('schemesAgeLbl')}</label>
                <input type="number" value={age} onChange={(e)=>setAge(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('schemesOccLbl')}</label>
                <select value={occupation} onChange={(e)=>setOccupation(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required>
                   <option value="" disabled>{t('schemesOccPlc')}</option>
                   <option value="Farmer">{t('occFarmer')}</option>
                   <option value="Student">{t('occStudent')}</option>
                   <option value="Business">{t('occBusiness')}</option>
                   <option value="Self-Employed">{t('occSelfExp')}</option>
                   <option value="Salaried Employee">{t('occSalaried')}</option>
                   <option value="Unemployed">{t('occUnemployed')}</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('schemesIncLbl')}</label>
                  <input type="number" value={income} onChange={(e)=>setIncome(e.target.value)} placeholder="e.g. 250000" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('schemesCasteLbl')}</label>
                  <select value={casteCategory} onChange={(e)=>setCasteCategory(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required>
                     <option value="" disabled>{t('schemesCastePlc')}</option>
                     <option value="General">{t('casGen')}</option>
                     <option value="OBC">{t('casObc')}</option>
                     <option value="SC/ST">{t('casScSt')}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('schemesStateLbl')}</label>
                  <select value={stateName} onChange={(e)=>setStateName(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required>
                     <option value="" disabled>{t('schemesStatePlc')}</option>
                     <option value="Andhra Pradesh">{t('stateAP')}</option>
                     <option value="Arunachal Pradesh">{t('stateAR')}</option>
                     <option value="Assam">{t('stateAS')}</option>
                     <option value="Bihar">{t('stateBR')}</option>
                     <option value="Chhattisgarh">{t('stateCG')}</option>
                     <option value="Delhi">{t('stateDL')}</option>
                     <option value="Goa">{t('stateGA')}</option>
                     <option value="Gujarat">{t('stateGJ')}</option>
                     <option value="Haryana">{t('stateHR')}</option>
                     <option value="Himachal Pradesh">{t('stateHP')}</option>
                     <option value="Jharkhand">{t('stateJH')}</option>
                     <option value="Karnataka">{t('stateKA')}</option>
                     <option value="Kerala">{t('stateKL')}</option>
                     <option value="Madhya Pradesh">{t('stateMP')}</option>
                     <option value="Maharashtra">{t('stateMH')}</option>
                     <option value="Manipur">{t('stateMN')}</option>
                     <option value="Meghalaya">{t('stateML')}</option>
                     <option value="Mizoram">{t('stateMZ')}</option>
                     <option value="Nagaland">{t('stateNL')}</option>
                     <option value="Odisha">{t('stateOD')}</option>
                     <option value="Punjab">{t('statePB')}</option>
                     <option value="Rajasthan">{t('stateRJ')}</option>
                     <option value="Sikkim">{t('stateSK')}</option>
                     <option value="Tamil Nadu">{t('stateTN')}</option>
                     <option value="Telangana">{t('stateTL')}</option>
                     <option value="Tripura">{t('stateTR')}</option>
                     <option value="Uttar Pradesh">{t('stateUP')}</option>
                     <option value="Uttarakhand">{t('stateUK')}</option>
                     <option value="West Bengal">{t('stateWB')}</option>
                     <option value="Other">{t('stateOther')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('schemesAreaLbl')}</label>
                  <select value={area} onChange={(e)=>setArea(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required>
                     <option value="" disabled>{t('schemesAreaPlc')}</option>
                     <option value="Rural">{t('areaRural')}</option>
                     <option value="Urban">{t('areaUrban')}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('schemesGenderLbl')}</label>
                  <select value={gender} onChange={(e)=>setGender(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required>
                     <option value="" disabled>{t('schemesGenderPlc')}</option>
                     <option value="Male">{t('genMale')}</option>
                     <option value="Female">{t('genFemale')}</option>
                     <option value="Other">{t('genOther')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>{t('schemesFamLbl')}</label>
                  <select value={familyStatus} onChange={(e)=>setFamilyStatus(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required>
                     <option value="" disabled>{t('schemesFamPlc')}</option>
                     <option value="BPL">{t('famBpl')}</option>
                     <option value="APL">{t('famApl')}</option>
                     <option value="Middle Class">{t('famMid')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dark)' }}>Education Level</label>
                <select value={educationLevel} onChange={(e)=>setEducationLevel(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' }} required>
                   <option value="" disabled>Select Education Level</option>
                   <option value="High School">High School</option>
                   <option value="Undergraduate">Undergraduate</option>
                   <option value="Postgraduate">Postgraduate</option>
                   <option value="Uneducated">Uneducated</option>
                   <option value="Any">Any</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ display: 'flex', gap: '8px', justifyContent: 'center', backgroundColor: '#F97316', padding: '1.1rem', fontSize: '1.1rem', borderRadius: '8px', border: 'none', marginTop: '1rem' }}>
                {loading ? <Loader size={22} className="animate-spin" /> : <Search size={22} />}
                {loading ? t('schemesEval') : t('schemesCheckBtn')}
              </button>
           </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {schemes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
              <h3 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem' }}>No schemes available for your profile</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your details to find eligible schemes.</p>
            </div>
          ) : (
            ['Welfare', 'Education', 'Health', 'Investment', 'Private'].map(category => {
               const categorySchemes = schemes.filter(s => s.category === category);
               if (categorySchemes.length === 0) return null;
               
               return (
                 <div key={category}>
                   <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                     {category} Schemes
                   </h3>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                     {categorySchemes.map((scheme) => {
                        const badgeStyle = getBadgeColor(scheme.type);
                        return (
                          <div key={scheme._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '16px', backgroundColor: 'var(--card-bg)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => setActiveScheme(scheme)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{scheme.category}</span>
                              <span style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text, padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{scheme.type}</span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.75rem', lineHeight: '1.4' }}>{scheme.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {scheme.description}
                            </p>
                            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>
                              <CheckCircle2 size={16} /> You are eligible
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                              <button className="btn w-full" style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: 'var(--text-dark)', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {t('schemesViewDetails')}
                              </button>
                            </div>
                          </div>
                        );
                     })}
                   </div>
                 </div>
               );
            })
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {activeScheme && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 10 }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F97316' }}>{activeScheme.category}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-dark)', marginTop: '0.25rem' }}>{activeScheme.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => readSchemeFull(activeScheme)} style={{ background: '#F9731615', border: 'none', color: '#F97316', cursor: 'pointer', padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('readAloud')}>
                  <Volume2 size={20} />
                </button>
                <button onClick={() => { setActiveScheme(null); window.speechSynthesis.cancel(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.6rem', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: 'transparent' }}>
               <p style={{ color: 'var(--text-dark)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                 {activeScheme.description}
               </p>

               <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                 <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                   <CheckCircle2 size={20} /> {t('schemesCoreBen')}
                 </h4>
                 <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                   {activeScheme.benefits.map((benefit, i) => (
                     <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '0.75rem', color: '#166534', fontSize: '0.95rem' }}>
                       <span style={{ color: '#22c55e', marginTop: '2px' }}>•</span> {benefit}
                     </li>
                   ))}
                 </ul>
               </div>

               <div>
                 <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                   <ShieldCheck size={20} color="#F97316" /> {t('schemesEligCrit')}
                 </h4>
                 <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                   {activeScheme.eligibilityDetails.map((req, i) => (
                     <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.85rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                       <FileText size={16} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} /> {req}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>

            {/* Hook Overridden Footer Make Actionable */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setActiveScheme(null); window.speechSynthesis.cancel(); }} style={{ flex: 1, padding: '0.85rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                {t('schemesCancel')}
              </button>
              <button onClick={() => { window.speechSynthesis.cancel(); navigate('/verify-documents', { state: { scheme: activeScheme } }); }} className="btn btn-primary" style={{ flex: 2, padding: '0.85rem', backgroundColor: '#F97316', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                {t('schemesApply')} <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Schemes;
