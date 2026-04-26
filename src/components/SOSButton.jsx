import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mic, Loader } from 'lucide-react';
import { sosTranslations } from '../utils/sosTranslations';
import { getCurrentLocation } from '../utils/location';
import './SOSButton.css';

const SOSButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [issueType, setIssueType] = useState('Other');
  const [description, setDescription] = useState('');
  const [lang, setLang] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const { API_URL, token } = useAuth();
  const t = sosTranslations[lang];

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.notSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    const targetLang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }[lang] || 'en-IN';
    recognition.lang = targetLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription((prev) => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = (e) => {
      console.error("Speech error", e.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleTrigger = () => {
    setLoading(true);

    const triggerAPI = async (lat, lng, address) => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        };

        const payload = {
          description,
          latitude: lat,
          longitude: lng,
          address: address || "Emergency Location",
          issueType,
          type: "Emergency",
          priority: "High"
        };

        const response = await axios.post(`${API_URL}/sos`, payload, config);

        if (response.status === 201) {
          alert("SOS sent successfully");
          setShowModal(false);
          setDescription('');
          setIssueType('Other');
          navigate('/complaints');
        } else {
          alert("Failed to send SOS. Please call emergency services directly.");
        }
      } catch (error) {
        console.error("Error sending SOS:", error);
        alert("Failed to send SOS. Please call emergency services directly.");
      } finally {
        setLoading(false);
      }
    };

    const dispatchSOS = async () => {
      try {
        const locData = await getCurrentLocation();
        triggerAPI(locData.latitude, locData.longitude, locData.address);
      } catch (err) {
        console.error("Location unavailable:", err);
        // Do NOT block SOS if location fails
        triggerAPI(null, null, null);
      }
    };
    
    dispatchSOS();
  };

  return (
    <>
      <button 
        className="sos-floating-button" 
        onClick={() => setShowModal(true)}
      >
        🚨
      </button>

      {showModal && (
        <div className="sos-modal-overlay">
          <div className="sos-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{t.title}</h2>
              <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>
            <p>{t.dispatchText}</p>
            
            <div className="sos-form-group">
              <label>{t.emergencyType}</label>
              <select 
                className="sos-input" 
                value={issueType} 
                onChange={(e) => setIssueType(e.target.value)}
                disabled={loading}
              >
                <option value="Fire">{t.fire}</option>
                <option value="Medical">{t.medical}</option>
                <option value="Police">{t.police}</option>
                <option value="Accident">{t.accident}</option>
                <option value="Other">{t.other}</option>
              </select>
            </div>
            
            <div className="sos-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ marginBottom: 0 }}>{t.descLabel}</label>
                <button type="button" onClick={handleVoiceInput} disabled={loading || isListening} style={{ background: 'none', border: 'none', color: isListening ? '#ef4444' : '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Voice Input">
                  {isListening ? <Loader size={18} className="animate-spin" /> : <Mic size={18} />}
                </button>
              </div>
              <textarea 
                className="sos-input" 
                rows="3" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                disabled={loading}
              />
            </div>

            <div className="sos-modal-actions">
              <button 
                className="sos-btn-cancel" 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                {t.cancel}
              </button>
              <button 
                className="sos-btn-confirm" 
                onClick={handleTrigger}
                disabled={loading}
              >
                {loading ? t.sending : t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
